package com.example.sss001.professional.application;

import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.professional.dto.ProfessionalDTO;
import com.example.sss001.specialty.domain.Specialty;
import com.example.sss001.specialty.domain.SpecialtyService;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.domain.UserService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professionals")
public class ProfessionalController {

    private final ProfessionalService service;
    private final UserService userService;
    private final SpecialtyService specialtyService;

    public ProfessionalController(
            ProfessionalService service,
            UserService userService,
            SpecialtyService specialtyService) {

        this.service = service;
        this.userService = userService;
        this.specialtyService = specialtyService;
    }

    @GetMapping
    public List<ProfessionalDTO> findAll(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double maxPrice) {

        return service.search(
                        specialty,
                        location,
                        maxPrice
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ProfessionalDTO getOwnProfile(
            Authentication authentication) {

        String email = authentication.getName();
        Professional professional = service.findByUserEmail(email);

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        return convertToDTO(professional);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ProfessionalDTO updateOwnProfile(
            @RequestBody Professional updateData,
            Authentication authentication) {

        String email = authentication.getName();
        Professional professional = service.findByUserEmail(email);

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        if (updateData.getLocation() != null && !updateData.getLocation().isBlank()) {
            professional.setLocation(updateData.getLocation().trim());
        }

        Professional saved = service.save(professional);
        return convertToDTO(saved);
    }

    @GetMapping("/{id}")
    public ProfessionalDTO findById(
            @PathVariable Long id) {

        Professional professional =
                service.findById(id);

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        return convertToDTO(professional);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalDTO save(
            @RequestBody Professional professional) {

        if (professional.getUser() == null ||
                professional.getUser().getId() == null) {

            throw new IllegalArgumentException(
                    "Debe indicar el usuario del profesional"
            );
        }

        User user =
                userService.findById(
                        professional.getUser().getId()
                );

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Usuario no encontrado"
            );
        }

        if (!"PROFESSIONAL".equals(user.getRole())) {
            throw new IllegalArgumentException(
                    "El usuario debe tener rol PROFESSIONAL"
            );
        }

        professional.setUser(user);

        if (professional.getSpecialty() != null &&
                professional.getSpecialty().getId() != null) {

            Specialty specialty =
                    specialtyService.findById(
                            professional.getSpecialty().getId()
                    );

            if (specialty == null) {
                throw new ResourceNotFoundException(
                        "Especialidad no encontrada"
                );
            }

            professional.setSpecialty(specialty);
        }

        Professional saved =
                service.save(professional);

        return convertToDTO(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalDTO update(
            @PathVariable Long id,
            @RequestBody Professional professional) {

        Professional existing =
                service.findById(id);

        if (existing == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        existing.setLocation(
                professional.getLocation()
        );

        existing.setRating(
                professional.getRating()
        );

        if (professional.getSpecialty() != null &&
                professional.getSpecialty().getId() != null) {

            Specialty specialty =
                    specialtyService.findById(
                            professional.getSpecialty().getId()
                    );

            if (specialty == null) {
                throw new ResourceNotFoundException(
                        "Especialidad no encontrada"
                );
            }

            existing.setSpecialty(specialty);
        }

        Professional updated =
                service.save(existing);

        return convertToDTO(updated);
    }

    // ---------------------------------------------------------
    // ELIMINAR - SOLO ADMIN
    // ---------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(
            @PathVariable Long id) {

        Professional professional =
                service.findById(id);

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        service.delete(id);
    }

    private ProfessionalDTO convertToDTO(
            Professional professional) {

        ProfessionalDTO dto =
                new ProfessionalDTO();

        dto.setId(
                professional.getId()
        );

        if (professional.getUser() != null) {

            dto.setName(
                    professional.getUser().getName()
            );

            dto.setUserId(
                    professional.getUser().getId()
            );
        }

        if (professional.getSpecialty() != null) {

            dto.setSpecialty(
                    professional.getSpecialty().getName()
            );
        }

        dto.setLocation(
                professional.getLocation()
        );

        dto.setRating(
                professional.getRating()
        );

        if (professional.getMedicalServices() != null &&
                !professional.getMedicalServices().isEmpty()) {

            Double minimumPrice =
                    professional.getMedicalServices()
                            .stream()
                            .map(service ->
                                    service.getPrice())
                            .filter(price ->
                                    price != null)
                            .min(Double::compareTo)
                            .orElse(null);

            dto.setPrice(minimumPrice);

        } else {

            dto.setPrice(null);
        }

        return dto;
    }
}