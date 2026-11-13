package com.example.sss001.favorite.infrastructure;

import com.example.sss001.favorite.domain.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository
        extends JpaRepository<Favorite, Long> {

    List<Favorite> findByPatientId(Long patientId);

    Optional<Favorite> findByPatientIdAndProfessionalId(
            Long patientId,
            Long professionalId
    );

    boolean existsByPatientIdAndProfessionalId(
            Long patientId,
            Long professionalId
    );
}