package com.example.sss001.medicalservice;

import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.medicalservice.domain.MedicalServiceManager;
import com.example.sss001.medicalservice.infrastructure.MedicalServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalServiceManagerTest {

    @Mock
    private MedicalServiceRepository repository;

    @InjectMocks
    private MedicalServiceManager service;

    @Test
    void shouldReturnAllMedicalServices() {

        MedicalService medicalService1 = new MedicalService();
        MedicalService medicalService2 = new MedicalService();

        when(repository.findAll())
                .thenReturn(List.of(medicalService1, medicalService2));

        List<MedicalService> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnMedicalServicesByProfessionalId() {

        MedicalService medicalService = new MedicalService();

        when(repository.findByProfessionalId(1L))
                .thenReturn(List.of(medicalService));

        List<MedicalService> result =
                service.findByProfessionalId(1L);

        assertEquals(1, result.size());

        verify(repository)
                .findByProfessionalId(1L);
    }

    @Test
    void shouldReturnMedicalServiceById() {

        MedicalService medicalService = new MedicalService();

        when(repository.findById(1L))
                .thenReturn(Optional.of(medicalService));

        MedicalService result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenMedicalServiceByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        MedicalService result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldSaveMedicalService() {

        MedicalService medicalService = new MedicalService();
        medicalService.setName("Consulta general");

        when(repository.save(medicalService))
                .thenReturn(medicalService);

        MedicalService result =
                service.save(medicalService);

        assertNotNull(result);
        assertEquals("Consulta general", result.getName());

        verify(repository)
                .save(medicalService);
    }

    @Test
    void shouldDeleteMedicalService() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
