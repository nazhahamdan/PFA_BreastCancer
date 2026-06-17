package com.breastcancer.backend.controller;

import com.breastcancer.backend.dto.*;
import com.breastcancer.backend.service.DiagnosticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/diagnostics")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    // GET tous les diagnostics d'un patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DiagnosticDTO>> getDiagnostics(@PathVariable Long patientId) {
        return ResponseEntity.ok(diagnosticService.getDiagnosticsByPatient(patientId));
    }

    // GET calendrier d'un mois
    @GetMapping("/patient/{patientId}/calendrier")
    public ResponseEntity<List<CalendrierJourDTO>> getCalendrier(
            @PathVariable Long patientId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(diagnosticService.getCalendrierMois(patientId, year, month));
    }

    // POST ajouter un diagnostic
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<DiagnosticDTO> ajouterDiagnostic(
            @PathVariable Long patientId,
            @RequestBody DiagnosticDTO dto
    ) {
        return ResponseEntity.ok(diagnosticService.ajouterDiagnostic(patientId, dto));
    }
}