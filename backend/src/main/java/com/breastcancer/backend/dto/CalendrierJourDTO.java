package com.breastcancer.backend.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendrierJourDTO {
    private LocalDate date;
    private String couleur; // BABY_PINK, MEDIUM_PINK, PINK, DARK_RED
    private int nombreDiagnostics;
    private List<DiagnosticDTO> diagnostics;
}