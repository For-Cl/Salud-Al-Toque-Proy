package com.example.sss001.patient;

import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.domain.PatientService;
import com.example.sss001.patient.infrastructure.PatientRepository;
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
class PatientServiceTest {

    @Mock
    private PatientRepository repository;

    @InjectMocks
    private PatientService service;

    @Test
    void shouldReturnAllPatients() {

        Patient patient1 = new Patient();
        Patient patient2 = new Patient();

        when(repository.findAll())
                .thenReturn(List.of(patient1, patient2));

        List<Patient> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnPatientById() {

        Patient patient = new Patient();

        when(repository.findById(1L))
                .thenReturn(Optional.of(patient));

        Patient result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenPatientByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Patient result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnPatientByUserEmail() {

        Patient patient = new Patient();

        when(repository.findByUserEmail("patient@gmail.com"))
                .thenReturn(Optional.of(patient));

        Patient result =
                service.findByUserEmail("patient@gmail.com");

        assertNotNull(result);

        verify(repository)
                .findByUserEmail("patient@gmail.com");
    }

    @Test
    void shouldReturnNullWhenPatientByUserEmailNotFound() {

        when(repository.findByUserEmail("unknown@gmail.com"))
                .thenReturn(Optional.empty());

        Patient result =
                service.findByUserEmail("unknown@gmail.com");

        assertNull(result);

        verify(repository)
                .findByUserEmail("unknown@gmail.com");
    }

    @Test
    void shouldSavePatient() {

        Patient patient = new Patient();
        patient.setAddress("Surco");

        when(repository.save(patient))
                .thenReturn(patient);

        Patient result =
                service.save(patient);

        assertNotNull(result);
        assertEquals("Surco", result.getAddress());

        verify(repository)
                .save(patient);
    }

    @Test
    void shouldDeletePatient() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
