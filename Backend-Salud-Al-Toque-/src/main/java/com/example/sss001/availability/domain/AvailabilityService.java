package com.example.sss001.availability.domain;

import com.example.sss001.availability.infrastructure.AvailabilityRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvailabilityService {

    private final AvailabilityRepository repository;

    public AvailabilityService(
            AvailabilityRepository repository) {

        this.repository = repository;
    }

    public List<Availability> findAll() {
        return repository.findAll();
    }

    public Availability findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Availability> findByProfessionalId(
            Long professionalId) {

        return repository.findByProfessionalId(
                professionalId
        );
    }

    public List<Availability> findByProfessionalAndDay(
            Long professionalId,
            String dayOfWeek) {

        return repository
                .findByProfessionalIdAndDayOfWeek(
                        professionalId,
                        dayOfWeek
                );
    }

    public Availability save(
            Availability availability) {

        return repository.save(availability);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}