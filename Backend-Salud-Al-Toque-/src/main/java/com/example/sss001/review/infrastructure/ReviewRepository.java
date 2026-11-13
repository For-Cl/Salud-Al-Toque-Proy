package com.example.sss001.review.infrastructure;

import com.example.sss001.review.domain.Review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    Optional<Review> findByAppointmentId(
            Long appointmentId
    );

    List<Review> findByProfessionalId(
            Long professionalId
    );

    boolean existsByAppointmentId(
            Long appointmentId
    );
}