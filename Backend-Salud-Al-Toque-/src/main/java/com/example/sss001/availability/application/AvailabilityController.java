package com.example.sss001.availability.application;

import com.example.sss001.availability.domain.Availability;
import com.example.sss001.availability.domain.AvailabilityService;
import com.example.sss001.availability.dto.AvailabilityDTO;
import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.exceptions.ResourceOwnershipException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/availabilities")
public class AvailabilityController {

    private final AvailabilityService service;
    private final ProfessionalService professionalService;

    public AvailabilityController(
            AvailabilityService service,
            ProfessionalService professionalService) {

        this.service = service;
        this.professionalService = professionalService;
    }

    @GetMapping
    public List<AvailabilityDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public AvailabilityDTO findById(
            @PathVariable Long id) {

        Availability availability =
                service.findById(id);

        if (availability == null) {

            throw new ResourceNotFoundException(
                    "Disponibilidad no encontrada"
            );
        }

        return convertToDTO(availability);
    }

    @GetMapping("/professional/{professionalId}")
    public List<AvailabilityDTO> findByProfessional(
            @PathVariable Long professionalId) {

        return service
                .findByProfessionalId(professionalId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public AvailabilityDTO save(
            @RequestBody Availability availability,
            Authentication authentication) {

        String email =
                authentication.getName();

        Professional professional =
                professionalService
                        .findByUserEmail(email);

        if (professional == null) {

            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        availability.setProfessional(
                professional
        );

        Availability saved =
                service.save(availability);

        return convertToDTO(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public void delete(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        Professional professional =
                professionalService
                        .findByUserEmail(email);

        if (professional == null) {

            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        Availability availability =
                service.findById(id);

        if (availability == null) {

            throw new ResourceNotFoundException(
                    "Disponibilidad no encontrada"
            );
        }

        if (availability.getProfessional() == null ||
                !availability.getProfessional()
                        .getId()
                        .equals(professional.getId())) {

            throw new ResourceOwnershipException(
                    "No puedes eliminar la disponibilidad de otro profesional"
            );
        }

        service.delete(id);
    }

    private AvailabilityDTO convertToDTO(
            Availability availability) {

        Long professionalId = null;

        if (availability.getProfessional() != null) {

            professionalId =
                    availability
                            .getProfessional()
                            .getId();
        }

        return new AvailabilityDTO(
                availability.getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime(),
                professionalId
        );
    }
}