package com.example.sss001.availability.infrastructure;

import com.example.sss001.availability.domain.Availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityRepository
        extends JpaRepository<Availability, Long> {

    List<Availability> findByProfessionalId(
            Long professionalId
    );

    List<Availability> findByProfessionalIdAndDayOfWeek(
            Long professionalId,
            String dayOfWeek
    );
}