package com.breastcancer.backend.repository;

import com.breastcancer.backend.entity.MammographyAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MammographyRepository extends JpaRepository<MammographyAnalysis, Long> {
    List<MammographyAnalysis> findByPatientIdOrderByDateAnalyseDesc(Long patientId);
}