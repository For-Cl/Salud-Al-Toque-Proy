package com.example.sss001.appointment;

import com.example.sss001.appointment.domain.Appointment;
import com.example.sss001.appointment.domain.AppointmentService;
import com.example.sss001.appointment.infrastructure.AppointmentRepository;
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
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository repository;

    @InjectMocks
    private AppointmentService service;

    @Test
    void shouldReturnAllAppointments() {

        Appointment appointment1 = new Appointment();
        Appointment appointment2 = new Appointment();

        when(repository.findAll())
                .thenReturn(List.of(appointment1, appointment2));

        List<Appointment> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnAppointmentById() {

        Appointment appointment = new Appointment();

        when(repository.findById(1L))
                .thenReturn(Optional.of(appointment));

        Appointment result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenAppointmentByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Appointment result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnAppointmentsByPatientId() {

        Appointment appointment = new Appointment();

        when(repository.findByPatientId(1L))
                .thenReturn(List.of(appointment));

        List<Appointment> result =
                service.findByPatientId(1L);

        assertEquals(1, result.size());

        verify(repository)
                .findByPatientId(1L);
    }

    @Test
    void shouldReturnAppointmentsByProfessionalId() {

        Appointment appointment = new Appointment();

        when(repository.findByProfessionalId(1L))
                .thenReturn(List.of(appointment));

        List<Appointment> result =
                service.findByProfessionalId(1L);

        assertEquals(1, result.size());

        verify(repository)
                .findByProfessionalId(1L);
    }

    @Test
    void shouldReturnAppointmentsByPatientEmail() {

        Appointment appointment = new Appointment();

        when(repository.findByPatientUserEmail("patient@gmail.com"))
                .thenReturn(List.of(appointment));

        List<Appointment> result =
                service.findByPatientEmail("patient@gmail.com");

        assertEquals(1, result.size());

        verify(repository)
                .findByPatientUserEmail("patient@gmail.com");
    }

    @Test
    void shouldReturnAppointmentsByProfessionalEmail() {

        Appointment appointment = new Appointment();

        when(repository.findByProfessionalUserEmail("professional@gmail.com"))
                .thenReturn(List.of(appointment));

        List<Appointment> result =
                service.findByProfessionalEmail("professional@gmail.com");

        assertEquals(1, result.size());

        verify(repository)
                .findByProfessionalUserEmail("professional@gmail.com");
    }

    @Test
    void shouldReturnTrueWhenAppointmentAlreadyExists() {

        when(repository.existsByProfessionalIdAndDateAndTime(
                1L, "2026-10-05", "10:30"))
                .thenReturn(true);

        boolean result =
                service.existsByProfessionalAndDateAndTime(
                        1L, "2026-10-05", "10:30");

        assertTrue(result);

        verify(repository)
                .existsByProfessionalIdAndDateAndTime(
                        1L, "2026-10-05", "10:30");
    }

    @Test
    void shouldReturnFalseWhenAppointmentDoesNotExist() {

        when(repository.existsByProfessionalIdAndDateAndTime(
                1L, "2099-01-01", "23:59"))
                .thenReturn(false);

        boolean result =
                service.existsByProfessionalAndDateAndTime(
                        1L, "2099-01-01", "23:59");

        assertFalse(result);

        verify(repository)
                .existsByProfessionalIdAndDateAndTime(
                        1L, "2099-01-01", "23:59");
    }

    @Test
    void shouldUpdateStatusWhenAppointmentExists() {

        Appointment appointment = new Appointment();
        appointment.setStatus("PENDIENTE");

        when(repository.findById(1L))
                .thenReturn(Optional.of(appointment));

        when(repository.save(appointment))
                .thenReturn(appointment);

        Appointment result =
                service.updateStatus(1L, "ACEPTADA");

        assertNotNull(result);
        assertEquals("ACEPTADA", result.getStatus());

        verify(repository).findById(1L);
        verify(repository).save(appointment);
    }

    @Test
    void shouldReturnNullWhenUpdatingStatusOfMissingAppointment() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Appointment result =
                service.updateStatus(1L, "ACEPTADA");

        assertNull(result);

        verify(repository).findById(1L);
        verify(repository, never()).save(any());
    }

    @Test
    void shouldSaveAppointment() {

        Appointment appointment = new Appointment();
        appointment.setStatus("PENDIENTE");

        when(repository.save(appointment))
                .thenReturn(appointment);

        Appointment result =
                service.save(appointment);

        assertNotNull(result);
        assertEquals("PENDIENTE", result.getStatus());

        verify(repository)
                .save(appointment);
    }

    @Test
    void shouldDeleteAppointment() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
