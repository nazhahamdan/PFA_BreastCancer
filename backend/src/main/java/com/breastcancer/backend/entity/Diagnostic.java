package com.breastcancer.backend.entity;

import com.breastcancer.backend.enums.DiagnosticStatus;
import com.breastcancer.backend.enums.DiagnosticType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "diagnostics")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Diagnostic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private DiagnosticType type;

    @Enumerated(EnumType.STRING)
    private DiagnosticStatus status;

    private LocalDate date;

    private String details;

    // Pour diagnostic symptômes
    private String symptomes;
    private String recommandation;

    // Pour mammographie
    private String imageUrl;
    private Double scoreConfidence;

    // Pour consultation médecin
    private String nomMedecin;
    private String resultatMedecin;
    private String notesMedecin;
}
