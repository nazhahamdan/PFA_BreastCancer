package com.breastcancer.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mammography_analysis")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MammographyAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String imageUrl;
    private String resultat; // CANCER / NORMAL
    private Double confidence;
    private LocalDateTime dateAnalyse;
    private String details;
}