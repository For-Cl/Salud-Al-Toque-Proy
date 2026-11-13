package com.example.sss001.medicalservice.infrastructure;

import com.example.sss001.medicalservice.domain.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalServiceRepository
        extends JpaRepository<MedicalService, Long> {

    List<MedicalService> findByProfessionalId(Long professionalId);
}