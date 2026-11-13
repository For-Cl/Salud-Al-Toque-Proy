package com.example.sss001.patient.application;

import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.domain.PatientService;
import com.example.sss001.patient.dto.PatientDTO;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PatientDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public PatientDTO getOwnInformation(
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                service.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        return convertToDTO(patient);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public PatientDTO updateOwnInformation(
            @RequestBody Patient updateData,
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                service.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        if (updateData.getAddress() != null) {
            patient.setAddress(updateData.getAddress().trim());
        }

        if (updateData.getDateOfBirth() != null) {
            patient.setDateOfBirth(updateData.getDateOfBirth());
        }

        Patient saved =
                service.save(patient);

        return convertToDTO(saved);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PatientDTO findById(
            @PathVariable Long id) {

        Patient patient =
                service.findById(id);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        return convertToDTO(patient);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PatientDTO save(
            @RequestBody Patient patient) {

        Patient saved =
                service.save(patient);

        return convertToDTO(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(
            @PathVariable Long id) {

        Patient patient =
                service.findById(id);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        service.delete(id);
    }

    private PatientDTO convertToDTO(
            Patient patient) {

        PatientDTO dto =
                new PatientDTO();

        dto.setId(
                patient.getId()
        );

        dto.setAddress(
                patient.getAddress()
        );

        dto.setDateOfBirth(
                patient.getDateOfBirth()
        );

        if (patient.getUser() != null) {

            dto.setUserId(
                    patient.getUser().getId()
            );

            dto.setName(
                    patient.getUser().getName()
            );

            dto.setEmail(
                    patient.getUser().getEmail()
            );
        }

        return dto;
    }
}