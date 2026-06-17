package com.breastcancer.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MammographyDTO {
    private Long id;
    private Long patientId;
    private String imageUrl;
    private String resultat;
    private Double confidence;
    private LocalDateTime dateAnalyse;
    private String details;
}