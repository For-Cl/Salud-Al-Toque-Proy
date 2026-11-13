package com.example.sss001.professional.infrastructure;

import com.example.sss001.professional.domain.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfessionalRepository
        extends JpaRepository<Professional, Long> {

    Optional<Professional> findByUserEmail(String email);

    List<Professional> findBySpecialtyNameIgnoreCase(
            String name
    );

    List<Professional> findByLocationIgnoreCase(
            String location
    );

    List<Professional> findDistinctByMedicalServicesPriceLessThanEqual(
            Double maxPrice
    );

    List<Professional> findBySpecialtyNameIgnoreCaseAndLocationIgnoreCase(
            String specialty,
            String location
    );

    List<Professional> findDistinctBySpecialtyNameIgnoreCaseAndMedicalServicesPriceLessThanEqual(
            String specialty,
            Double maxPrice
    );

    List<Professional> findDistinctByLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
            String location,
            Double maxPrice
    );

    List<Professional> findDistinctBySpecialtyNameIgnoreCaseAndLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
            String specialty,
            String location,
            Double maxPrice
    );
}