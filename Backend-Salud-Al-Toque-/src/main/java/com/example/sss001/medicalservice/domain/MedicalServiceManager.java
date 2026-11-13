package com.example.sss001.medicalservice.domain;

import com.example.sss001.medicalservice.infrastructure.MedicalServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalServiceManager {

    private final MedicalServiceRepository repository;

    public MedicalServiceManager(
            MedicalServiceRepository repository) {

        this.repository = repository;
    }

    public List<MedicalService> findAll() {
        return repository.findAll();
    }

    public List<MedicalService> findByProfessionalId(
            Long professionalId) {

        return repository.findByProfessionalId(professionalId);
    }

    public MedicalService findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public MedicalService save(MedicalService medicalService) {
        return repository.save(medicalService);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}