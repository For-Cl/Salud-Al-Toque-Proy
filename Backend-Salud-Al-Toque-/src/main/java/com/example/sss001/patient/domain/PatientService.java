package com.example.sss001.patient.domain;

import com.example.sss001.patient.infrastructure.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public List<Patient> findAll() {
        return repository.findAll();
    }

    public Patient findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Patient findByUserEmail(String email) {
        return repository.findByUserEmail(email).orElse(null);
    }

    public Patient save(Patient patient) {
        return repository.save(patient);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}