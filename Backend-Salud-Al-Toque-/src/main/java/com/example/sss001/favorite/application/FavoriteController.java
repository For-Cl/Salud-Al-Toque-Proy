package com.example.sss001.favorite.application;

import com.example.sss001.exceptions.ConflictException;
import com.example.sss001.exceptions.ForbiddenException;
import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.favorite.domain.Favorite;
import com.example.sss001.favorite.domain.FavoriteService;
import com.example.sss001.favorite.dto.FavoriteDTO;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.domain.PatientService;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteService service;
    private final PatientService patientService;
    private final ProfessionalService professionalService;

    public FavoriteController(
            FavoriteService service,
            PatientService patientService,
            ProfessionalService professionalService) {

        this.service = service;
        this.patientService = patientService;
        this.professionalService = professionalService;
    }

    @GetMapping("/my-favorites")
    @PreAuthorize("hasRole('PATIENT')")
    public List<FavoriteDTO> myFavorites(
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                patientService.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        return service.findByPatientId(patient.getId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @PostMapping("/professional/{professionalId}")
    @PreAuthorize("hasRole('PATIENT')")
    public FavoriteDTO addFavorite(
            @PathVariable Long professionalId,
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                patientService.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        Professional professional =
                professionalService.findById(
                        professionalId
                );

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        if (service.existsByPatientAndProfessional(
                patient.getId(),
                professional.getId())) {

            throw new ConflictException(
                    "El profesional ya está en tus favoritos"
            );
        }

        Favorite favorite =
                new Favorite();

        favorite.setPatient(patient);
        favorite.setProfessional(professional);

        Favorite saved =
                service.save(favorite);

        return convertToDTO(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public void deleteFavorite(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                patientService.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        Favorite favorite =
                service.findById(id);

        if (favorite == null) {
            throw new ResourceNotFoundException(
                    "Favorito no encontrado"
            );
        }

        if (favorite.getPatient() == null ||
                !favorite.getPatient()
                        .getId()
                        .equals(patient.getId())) {

            throw new ForbiddenException(
                    "No puedes eliminar el favorito de otro paciente"
            );
        }
        service.delete(id);
    }

    private FavoriteDTO convertToDTO(
            Favorite favorite) {

        Long patientId = null;
        Long professionalId = null;

        String professionalName = null;
        String specialty = null;
        String location = null;
        Double rating = null;

        if (favorite.getPatient() != null) {
            patientId =
                    favorite.getPatient().getId();
        }

        if (favorite.getProfessional() != null) {

            Professional professional =
                    favorite.getProfessional();

            professionalId =
                    professional.getId();

            location =
                    professional.getLocation();

            rating =
                    professional.getRating();

            if (professional.getUser() != null) {

                professionalName =
                        professional.getUser().getName();
            }

            if (professional.getSpecialty() != null) {

                specialty =
                        professional
                                .getSpecialty()
                                .getName();
            }
        }

        return new FavoriteDTO(
                favorite.getId(),
                patientId,
                professionalId,
                professionalName,
                specialty,
                location,
                rating
        );
    }
}