package com.breastcancer.backend.service;


import com.breastcancer.backend.dto.*;
import com.breastcancer.backend.entity.*;
import com.breastcancer.backend.enums.DiagnosticStatus;
import com.breastcancer.backend.enums.DiagnosticType;
import com.breastcancer.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagnosticService {

    private final DiagnosticRepository diagnosticRepository;
    private final PatientRepository patientRepository;

    // Récupérer tous les diagnostics d'un patient
    public List<DiagnosticDTO> getDiagnosticsByPatient(Long patientId) {
        return diagnosticRepository.findByPatientIdOrderByDateDesc(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Récupérer le calendrier d'un mois
    public List<CalendrierJourDTO> getCalendrierMois(Long patientId, int year, int month) {
        List<Diagnostic> diagnostics = diagnosticRepository
                .findByPatientIdAndYearAndMonth(patientId, year, month);

        // Grouper par date
        Map<LocalDate, List<Diagnostic>> parDate = diagnostics.stream()
                .collect(Collectors.groupingBy(Diagnostic::getDate));

        List<CalendrierJourDTO> calendrier = new ArrayList<>();
        parDate.forEach((date, diags) -> {
            String couleur = calculerCouleur(diags);
            calendrier.add(CalendrierJourDTO.builder()
                    .date(date)
                    .couleur(couleur)
                    .nombreDiagnostics(diags.size())
                    .diagnostics(diags.stream().map(this::toDTO).collect(Collectors.toList()))
                    .build());
        });

        calendrier.sort(Comparator.comparing(CalendrierJourDTO::getDate));
        return calendrier;
    }

    // Ajouter un diagnostic
    public DiagnosticDTO ajouterDiagnostic(Long patientId, DiagnosticDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Diagnostic diagnostic = Diagnostic.builder()
                .patient(patient)
                .type(dto.getType())
                .status(dto.getStatus())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .details(dto.getDetails())
                .symptomes(dto.getSymptomes())
                .recommandation(dto.getRecommandation())
                .imageUrl(dto.getImageUrl())
                .scoreConfidence(dto.getScoreConfidence())
                .nomMedecin(dto.getNomMedecin())
                .resultatMedecin(dto.getResultatMedecin())
                .notesMedecin(dto.getNotesMedecin())
                .build();

        return toDTO(diagnosticRepository.save(diagnostic));
    }

    // Calculer la couleur selon les diagnostics du jour
    private String calculerCouleur(List<Diagnostic> diagnostics) {
        // Priorité : CANCER > SUSPECT > consultation médecin bon > symptôme bon
        boolean hasCancer = diagnostics.stream()
                .anyMatch(d -> d.getStatus() == DiagnosticStatus.CANCER);
        if (hasCancer) return "DARK_RED";

        boolean hasSuspect = diagnostics.stream()
                .anyMatch(d -> d.getStatus() == DiagnosticStatus.SUSPECT);
        if (hasSuspect) return "MEDIUM_PINK";

        boolean hasConsultationBonne = diagnostics.stream()
                .anyMatch(d -> d.getType() == DiagnosticType.DOCTOR_CONSULTATION
                        && d.getStatus() == DiagnosticStatus.BON);
        if (hasConsultationBonne) return "PINK";

        return "BABY_PINK";
    }

    // Convertir entité → DTO
    private DiagnosticDTO toDTO(Diagnostic d) {
        return DiagnosticDTO.builder()
                .id(d.getId())
                .type(d.getType())
                .status(d.getStatus())
                .date(d.getDate())
                .details(d.getDetails())
                .symptomes(d.getSymptomes())
                .recommandation(d.getRecommandation())
                .imageUrl(d.getImageUrl())
                .scoreConfidence(d.getScoreConfidence())
                .nomMedecin(d.getNomMedecin())
                .resultatMedecin(d.getResultatMedecin())
                .notesMedecin(d.getNotesMedecin())
                .couleur(calculerCouleurSingle(d))
                .build();
    }

    private String calculerCouleurSingle(Diagnostic d) {
        if (d.getStatus() == DiagnosticStatus.CANCER) return "DARK_RED";
        if (d.getStatus() == DiagnosticStatus.SUSPECT) return "MEDIUM_PINK";
        if (d.getType() == DiagnosticType.DOCTOR_CONSULTATION) return "PINK";
        return "BABY_PINK";
    }
}
