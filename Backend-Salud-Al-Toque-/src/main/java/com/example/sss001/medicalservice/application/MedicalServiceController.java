package com.example.sss001.medicalservice.application;

import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.medicalservice.domain.MedicalServiceManager;
import com.example.sss001.medicalservice.dto.MedicalServiceDTO;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.exceptions.ResourceOwnershipException;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-services")
public class MedicalServiceController {

    private final MedicalServiceManager service;
    private final ProfessionalService professionalService;

    public MedicalServiceController(
            MedicalServiceManager service,
            ProfessionalService professionalService) {

        this.service = service;
        this.professionalService = professionalService;
    }

    @GetMapping
    public List<MedicalServiceDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public MedicalServiceDTO findById(
            @PathVariable Long id) {

        MedicalService medicalService =
                service.findById(id);

        if (medicalService == null) {

            throw new ResourceNotFoundException(
                    "Servicio médico no encontrado"
            );
        }

        return convertToDTO(medicalService);
    }


    @GetMapping("/professional/{professionalId}")
    public List<MedicalServiceDTO> findByProfessional(
            @PathVariable Long professionalId) {

        return service
                .findByProfessionalId(professionalId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public MedicalServiceDTO save(
            @RequestBody MedicalService medicalService,
            Authentication authentication) {

        String email =
                authentication.getName();

        Professional professional =
                professionalService.findByUserEmail(
                        email
                );

        if (professional == null) {

            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        medicalService.setProfessional(
                professional
        );

        MedicalService saved =
                service.save(medicalService);

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
                professionalService.findByUserEmail(
                        email
                );

        if (professional == null) {

            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        MedicalService medicalService =
                service.findById(id);

        if (medicalService == null) {

            throw new ResourceNotFoundException(
                    "Servicio médico no encontrado"
            );
        }

        if (medicalService.getProfessional() == null ||
                !medicalService.getProfessional()
                        .getId()
                        .equals(professional.getId())) {

            throw new ResourceOwnershipException(
                    "No puedes eliminar el servicio de otro profesional"
            );
        }

        service.delete(id);
    }

    private MedicalServiceDTO convertToDTO(
            MedicalService medicalService) {

        Long professionalId = null;

        if (medicalService.getProfessional() != null) {

            professionalId =
                    medicalService
                            .getProfessional()
                            .getId();
        }

        return new MedicalServiceDTO(
                medicalService.getId(),
                medicalService.getName(),
                medicalService.getDescription(),
                medicalService.getPrice(),
                professionalId
        );
    }
}