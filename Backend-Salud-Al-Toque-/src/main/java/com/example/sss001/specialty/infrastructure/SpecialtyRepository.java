package com.example.sss001.specialty.infrastructure;

import com.example.sss001.specialty.domain.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpecialtyRepository
        extends JpaRepository<Specialty, Long> {

    Optional<Specialty> findByName(String name);
}