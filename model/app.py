from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import os, uuid, json, base64, io
import matplotlib.cm as cm
import cv2

app = Flask(__name__)
os.makedirs('uploads', exist_ok=True)

# ─── Chargement du modèle ────────────────────────────────────────────────────
model_dir = 'efficientnetb3_best_phaseC.keras'

with open(os.path.join(model_dir, 'config.json'), 'r') as f:
    config = json.load(f)

model = tf.keras.models.model_from_json(json.dumps(config))
model.load_weights(os.path.join(model_dir, 'model.weights.h5'))
print("Modèle chargé avec succès !")

# ─── Constantes ──────────────────────────────────────────────────────────────
CLASS_NAMES = {
    0: 'Negative',
    1: 'B. Calc',
    2: 'B. Mass',
    3: 'M. Calc',
    4: 'M. Mass'
}

PREPROCESS_FN       = tf.keras.applications.efficientnet.preprocess_input
INPUT_SIZE          = 300
EXTENSIONS          = {'jpg', 'jpeg', 'png'}
GRADCAM_LAYER       = 'top_activation'   # couche cible pour EfficientNetB3

# ─── Utilitaires ─────────────────────────────────────────────────────────────
def extension_valide(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in EXTENSIONS


def preprocess_image(chemin):
    """Charge et préprocesse l'image pour le modèle. Retourne (batch, raw_array)."""
    img_pil = Image.open(chemin).convert('L')
    raw     = np.array(img_pil, dtype=np.uint8)          # (H, W) uint8 – pour overlay

    img = raw.astype(np.float32)[:, :, np.newaxis]
    img = np.repeat(img, 3, axis=-1)
    img = tf.image.resize(img, [INPUT_SIZE, INPUT_SIZE]).numpy()
    img = PREPROCESS_FN(img)
    return np.expand_dims(img, axis=0), raw              # (1,300,300,3), (H,W)


# ─── Grad-CAM ────────────────────────────────────────────────────────────────
def get_gradcam_heatmap(image_batch, last_conv_layer_name):
    """
    image_batch : (1, H, W, 3) float32 préprocessé
    Retourne (heatmap, classe_idx, probas)
    """
    grad_model = tf.keras.Model(
        inputs  = model.input,
        outputs = [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(image_batch, training=False)
        predicted_class = tf.argmax(predictions[0])
        class_score     = predictions[:, predicted_class]

    grads        = tape.gradient(class_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_out = conv_outputs[0]
    heatmap  = conv_out @ pooled_grads[..., tf.newaxis]
    heatmap  = tf.squeeze(heatmap)
    heatmap  = tf.nn.relu(heatmap)
    heatmap  = heatmap / (tf.math.reduce_max(heatmap) + 1e-8)

    return heatmap.numpy(), int(predicted_class.numpy()), predictions[0].numpy()


def overlay_gradcam(original_gray, heatmap, alpha=0.4):
    """
    original_gray : (H, W) uint8
    heatmap       : (h, w) float [0, 1]
    Retourne une image PIL RGB avec la heatmap superposée.
    """
    h, w = original_gray.shape
    heatmap_resized = cv2.resize(heatmap, (w, h))

    heatmap_colored = cm.jet(heatmap_resized)[:, :, :3]  # (H,W,3) float [0,1]

    img_rgb = np.stack([original_gray] * 3, axis=-1).astype(float) / 255.0

    overlay = alpha * heatmap_colored + (1 - alpha) * img_rgb
    overlay = np.clip(overlay, 0, 1)

    return Image.fromarray((overlay * 255).astype(np.uint8))


def image_to_base64(pil_image, fmt='PNG'):
    """Encode une image PIL en string base64."""
    buffer = io.BytesIO()
    pil_image.save(buffer, format=fmt)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "Aucun fichier reçu"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "Fichier vide"}), 400

    if not extension_valide(file.filename):
        return jsonify({"error": "Format non supporté"}), 400

    # Paramètre optionnel ?gradcam=true (true par défaut)
    include_gradcam = request.args.get('gradcam', 'true').lower() != 'false'

    chemin = os.path.join('uploads', f"{uuid.uuid4().hex}.jpg")

    try:
        file.save(chemin)

        input_data, raw_gray = preprocess_image(chemin)

        # ── Prédiction ────────────────────────────────────────────────────────
        if include_gradcam:
            heatmap, classe_index, probas = get_gradcam_heatmap(input_data, GRADCAM_LAYER)
            prediction = probas
        else:
            prediction_tensor = model.predict(input_data, verbose=0)
            prediction        = prediction_tensor[0]
            classe_index      = int(np.argmax(prediction))
            heatmap           = None

        confiance    = float(np.max(prediction))
        label        = CLASS_NAMES[classe_index]
        is_malignant = classe_index in [3, 4]

        response = {
            "result"      : "CANCER" if is_malignant else "NORMAL",
            "confidence"  : round(confiance, 4),
            "label"       : label,
            "classe_index": classe_index,
            "probabilites": {
                CLASS_NAMES[i]: round(float(prediction[i]), 4)
                for i in range(5)
            }
        }

        # ── Grad-CAM overlay ─────────────────────────────────────────────────
        if include_gradcam and heatmap is not None:
            overlay_img = overlay_gradcam(raw_gray, heatmap, alpha=0.4)
            response["gradcam"] = {
                "overlay_base64" : image_to_base64(overlay_img),
                "format"         : "PNG",
                "layer_used"     : GRADCAM_LAYER,
                "description"    : (
                    "Grad-CAM overlay: les zones en rouge/jaune indiquent "
                    "les régions les plus influentes pour la prédiction."
                )
            }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(chemin):
            os.remove(chemin)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "efficientnetb3"}), 200


if __name__ == '__main__':
    app.run(debug=False, port=5000)