package com.breastcancer.backend.service;

import com.breastcancer.backend.dto.MammographyDTO;
import com.breastcancer.backend.entity.Diagnostic;
import com.breastcancer.backend.entity.MammographyAnalysis;
import com.breastcancer.backend.entity.Patient;
import com.breastcancer.backend.enums.DiagnosticStatus;
import com.breastcancer.backend.enums.DiagnosticType;
import com.breastcancer.backend.repository.DiagnosticRepository;
import com.breastcancer.backend.repository.MammographyRepository;
import com.breastcancer.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MammographyService {

    private final MammographyRepository mammographyRepository;
    private final PatientRepository     patientRepository;
    private final DiagnosticRepository  diagnosticRepository;
    private final RestTemplate          restTemplate;

    private static final String AI_MODEL_URL = "http://localhost:5000/predict";
    private static final String UPLOAD_DIR   = "uploads/mammography/";

    @SuppressWarnings("unchecked")
    public MammographyDTO analyserImage(Long patientId, MultipartFile image) throws IOException {

        String imageUrl = sauvegarderImage(image);
        Map<String, Object> prediction = envoyerAuModele(image);

        // Utiliser classe_index pour déterminer le résultat correctement
        int    classeIndex = ((Number) prediction.get("classe_index")).intValue();
        Double confidence  = ((Number) prediction.get("confidence")).doubleValue();
        String label       = (String) prediction.get("label");
        String resultat    = determinerResultat(classeIndex);

        Map<String, Double> probabilites = new HashMap<>();
        Map<String, Object> probRaw = (Map<String, Object>) prediction.get("probabilites");
        if (probRaw != null) {
            probRaw.forEach((k, v) -> probabilites.put(k, ((Number) v).doubleValue()));
        }

        // Extraire le Grad-CAM
        String gradcamBase64 = null;
        Map<String, Object> gradcamRaw = (Map<String, Object>) prediction.get("gradcam");
        if (gradcamRaw != null) {
            gradcamBase64 = (String) gradcamRaw.get("overlay_base64");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        MammographyAnalysis analysis = MammographyAnalysis.builder()
                .patient(patient)
                .imageUrl(imageUrl)
                .resultat(resultat)
                .confidence(confidence)
                .dateAnalyse(LocalDateTime.now())
                .details(genererDetails(resultat, confidence, label))
                .label(label)
                .probabilites(probabilites)
                .gradcamBase64(gradcamBase64)
                .build();

        mammographyRepository.save(analysis);

        // Créer un Diagnostic pour le calendrier
        DiagnosticStatus status = switch (resultat) {
            case "CANCER" -> DiagnosticStatus.CANCER;
            case "BENIN"  -> DiagnosticStatus.BON;   // adapter selon ton enum
            default       -> DiagnosticStatus.BON;
        };

        Diagnostic diagnostic = Diagnostic.builder()
                .patient(patient)
                .type(DiagnosticType.MAMMOGRAPHY_ANALYSIS)
                .status(status)
                .date(LocalDate.now())
                .details(genererDetails(resultat, confidence, label))
                .imageUrl(imageUrl)
                .scoreConfidence(confidence * 100)
                .build();

        diagnosticRepository.save(diagnostic);

        return toDTO(mammographyRepository.save(analysis));
    }

    public List<MammographyDTO> getHistorique(Long patientId) {
        return mammographyRepository.findByPatientIdOrderByDateAnalyseDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Logique de résultat sur 3 niveaux ───────────────────────────────────
    private String determinerResultat(int classeIndex) {
        return switch (classeIndex) {
            case 0      -> "NORMAL";          // Negative
            case 1, 2   -> "BENIN";           // B. Calc ou B. Mass
            case 3, 4   -> "CANCER";          // M. Calc ou M. Mass
            default     -> "NORMAL";
        };
    }

    private String genererDetails(String resultat, Double confidence, String label) {
        return switch (resultat) {
            case "CANCER" -> String.format(
                    "Analyse IA : anomalie maligne détectée (%s) avec %.1f%% de confiance. " +
                            "Consultation médicale urgente recommandée.",
                    label, confidence * 100);
            case "BENIN" -> String.format(
                    "Analyse IA : anomalie bénigne détectée (%s) avec %.1f%% de confiance. " +
                            "Un suivi médical est recommandé.",
                    label, confidence * 100);
            default -> String.format(
                    "Analyse IA : aucune anomalie détectée (%s) avec %.1f%% de confiance. " +
                            "Continuez vos contrôles réguliers.",
                    label, confidence * 100);
        };
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private Map<String, Object> envoyerAuModele(MultipartFile image) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(image.getBytes()) {
            @Override public String getFilename() { return image.getOriginalFilename(); }
        });

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(AI_MODEL_URL, request, Map.class);
        return response.getBody();
    }

    private String sauvegarderImage(MultipartFile image) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Files.copy(image.getInputStream(), uploadPath.resolve(filename));
        return UPLOAD_DIR + filename;
    }

    private MammographyDTO toDTO(MammographyAnalysis a) {
        return MammographyDTO.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .imageUrl(a.getImageUrl())
                .resultat(a.getResultat())
                .confidence(a.getConfidence())
                .dateAnalyse(a.getDateAnalyse())
                .details(a.getDetails())
                .label(a.getLabel())
                .probabilites(a.getProbabilites())
                .gradcamBase64(a.getGradcamBase64())
                .build();
    }
}