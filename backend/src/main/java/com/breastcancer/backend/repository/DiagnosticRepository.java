package com.breastcancer.backend.repository;

import com.breastcancer.backend.entity.Diagnostic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface DiagnosticRepository extends JpaRepository<Diagnostic, Long> {

    List<Diagnostic> findByPatientIdOrderByDateDesc(Long patientId);

    List<Diagnostic> findByPatientIdAndDateBetween(
            Long patientId, LocalDate start, LocalDate end
    );

    @Query("SELECT d FROM Diagnostic d WHERE d.patient.id = :patientId AND YEAR(d.date) = :year AND MONTH(d.date) = :month")
    List<Diagnostic> findByPatientIdAndYearAndMonth(
            @Param("patientId") Long patientId,
            @Param("year") int year,
            @Param("month") int month
    );
}
