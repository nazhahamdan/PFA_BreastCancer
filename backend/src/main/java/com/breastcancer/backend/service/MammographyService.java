package com.breastcancer.backend.service;

import com.breastcancer.backend.dto.MammographyDTO;
import com.breastcancer.backend.entity.MammographyAnalysis;
import com.breastcancer.backend.entity.Patient;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MammographyService {

    private final MammographyRepository mammographyRepository;
    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;

    // URL de votre modèle Python Flask/FastAPI
    private static final String AI_MODEL_URL = "http://localhost:5000/predict";
    private static final String UPLOAD_DIR = "uploads/mammography/";

    // Analyser une image
    public MammographyDTO analyserImage(Long patientId, MultipartFile image) throws IOException {

        // 1. Sauvegarder l'image
        String imageUrl = sauvegarderImage(image);

        // 2. Envoyer au modèle IA
        Map<String, Object> prediction = envoyerAuModele(image);

        String resultat = (String) prediction.get("result");       // "CANCER" ou "NORMAL"
        Double confidence = (Double) prediction.get("confidence"); // ex: 0.92

        // 3. Sauvegarder en base
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        MammographyAnalysis analysis = MammographyAnalysis.builder()
                .patient(patient)
                .imageUrl(imageUrl)
                .resultat(resultat)
                .confidence(confidence)
                .dateAnalyse(LocalDateTime.now())
                .details(genererDetails(resultat, confidence))
                .build();

        return toDTO(mammographyRepository.save(analysis));
    }

    // Récupérer l'historique d'un patient
    public List<MammographyDTO> getHistorique(Long patientId) {
        return mammographyRepository.findByPatientIdOrderByDateAnalyseDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Envoyer l'image au modèle Python
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

    // Sauvegarder l'image sur le serveur
    private String sauvegarderImage(MultipartFile image) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Files.copy(image.getInputStream(), uploadPath.resolve(filename));
        return UPLOAD_DIR + filename;
    }

    private String genererDetails(String resultat, Double confidence) {
        if ("CANCER".equals(resultat)) {
            return String.format("Analyse IA : anomalie détectée avec %.1f%% de confiance. Consultation médicale urgente recommandée.", confidence * 100);
        }
        return String.format("Analyse IA : aucune anomalie détectée avec %.1f%% de confiance. Continuez vos contrôles réguliers.", confidence * 100);
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
                .build();
    }
}