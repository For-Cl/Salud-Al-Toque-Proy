package com.example.sss001.favorite.domain;

import com.example.sss001.favorite.infrastructure.FavoriteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository repository;

    public FavoriteService(FavoriteRepository repository) {
        this.repository = repository;
    }

    public List<Favorite> findByPatientId(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    public Favorite findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Favorite save(Favorite favorite) {
        return repository.save(favorite);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public boolean existsByPatientAndProfessional(
            Long patientId,
            Long professionalId) {

        return repository.existsByPatientIdAndProfessionalId(
                patientId,
                professionalId
        );
    }
}