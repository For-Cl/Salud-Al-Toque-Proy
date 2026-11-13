package com.example.sss001.review.domain;

import com.example.sss001.review.infrastructure.ReviewRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository repository;

    public ReviewService(
            ReviewRepository repository) {

        this.repository = repository;
    }

    public List<Review> findAll() {
        return repository.findAll();
    }

    public Review findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Review findByAppointmentId(
            Long appointmentId) {

        return repository
                .findByAppointmentId(appointmentId)
                .orElse(null);
    }

    public List<Review> findByProfessionalId(
            Long professionalId) {

        return repository.findByProfessionalId(
                professionalId
        );
    }

    public boolean existsByAppointmentId(
            Long appointmentId) {

        return repository
                .existsByAppointmentId(appointmentId);
    }

    public Review save(Review review) {
        return repository.save(review);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}