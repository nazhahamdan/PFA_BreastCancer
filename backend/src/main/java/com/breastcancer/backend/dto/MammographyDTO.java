package com.breastcancer.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MammographyDTO {
    private Long id;
    private Long patientId;
    private String imageUrl;
    private String resultat;
    private Double confidence;
    private LocalDateTime dateAnalyse;
    private String details;
    private String label;                        // ← ajouter
    private Map<String, Double> probabilites;
    private String gradcamBase64;
}