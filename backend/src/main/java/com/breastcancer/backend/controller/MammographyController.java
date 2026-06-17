package com.breastcancer.backend.controller;

import com.breastcancer.backend.dto.MammographyDTO;
import com.breastcancer.backend.service.MammographyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/mammography")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class MammographyController {

    private final MammographyService mammographyService;

    // POST analyser une image
    @PostMapping("/patient/{patientId}/analyse")
    public ResponseEntity<MammographyDTO> analyser(
            @PathVariable Long patientId,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        return ResponseEntity.ok(mammographyService.analyserImage(patientId, image));
    }

    // GET historique
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<MammographyDTO>> getHistorique(@PathVariable Long patientId) {
        return ResponseEntity.ok(mammographyService.getHistorique(patientId));
    }
}