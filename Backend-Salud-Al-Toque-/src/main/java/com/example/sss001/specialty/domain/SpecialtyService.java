package com.example.sss001.specialty.domain;

import com.example.sss001.specialty.infrastructure.SpecialtyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialtyService {

    private final SpecialtyRepository repository;

    public SpecialtyService(SpecialtyRepository repository) {
        this.repository = repository;
    }

    public List<Specialty> findAll() {
        return repository.findAll();
    }

    public Specialty findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Specialty save(Specialty specialty) {
        return repository.save(specialty);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}