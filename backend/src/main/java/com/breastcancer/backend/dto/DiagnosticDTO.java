package com.breastcancer.backend.dto;

import com.breastcancer.backend.enums.DiagnosticStatus;
import com.breastcancer.backend.enums.DiagnosticType;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DiagnosticDTO {
    private Long id;
    private DiagnosticType type;
    private DiagnosticStatus status;
    private LocalDate date;
    private String details;
    private String symptomes;
    private String recommandation;
    private String imageUrl;
    private Double scoreConfidence;
    private String nomMedecin;
    private String resultatMedecin;
    private String notesMedecin;
    private String couleur; // calculé automatiquement
}