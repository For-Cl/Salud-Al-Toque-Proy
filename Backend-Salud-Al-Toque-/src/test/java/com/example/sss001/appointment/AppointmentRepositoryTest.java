package com.example.sss001.appointment;

import com.example.sss001.appointment.domain.Appointment;
import com.example.sss001.appointment.infrastructure.AppointmentRepository;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import com.example.sss001.AbstractContainerBaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AppointmentRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindAppointmentsByPatientId() {

        List<Appointment> appointments =
                appointmentRepository.findByPatientId(1L);

        assertFalse(appointments.isEmpty());

        assertEquals(
                1L,
                appointments.get(0).getPatient().getId()
        );
    }

    @Test
    void shouldFindAppointmentsByProfessionalId() {

        List<Appointment> appointments =
                appointmentRepository.findByProfessionalId(1L);

        assertFalse(appointments.isEmpty());

        assertEquals(
                1L,
                appointments.get(0).getProfessional().getId()
        );
    }

    @Test
    void shouldFindAppointmentsByPatientUserEmail() {

        User patient = userRepository
                .findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        List<Appointment> appointments =
                appointmentRepository.findByPatientUserEmail(
                        patient.getEmail()
                );

        assertFalse(appointments.isEmpty());

        assertEquals(
                patient.getEmail(),
                appointments.get(0)
                        .getPatient()
                        .getUser()
                        .getEmail()
        );
    }

    @Test
    void shouldFindAppointmentsByProfessionalUserEmail() {

        User professional = userRepository
                .findAll()
                .stream()
                .filter(user -> "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        List<Appointment> appointments =
                appointmentRepository.findByProfessionalUserEmail(
                        professional.getEmail()
                );

        assertFalse(appointments.isEmpty());

        assertEquals(
                professional.getEmail(),
                appointments.get(0)
                        .getProfessional()
                        .getUser()
                        .getEmail()
        );
    }

    @Test
    void shouldDetectExistingAppointment() {

        boolean exists =
                appointmentRepository
                        .existsByProfessionalIdAndDateAndTime(
                                1L,
                                "2026-10-05",
                                "10:30"
                        );

        assertTrue(exists);
    }

    @Test
    void shouldReturnFalseWhenAppointmentDoesNotExist() {

        boolean exists =
                appointmentRepository
                        .existsByProfessionalIdAndDateAndTime(
                                1L,
                                "2099-01-01",
                                "23:59"
                        );

        assertFalse(exists);
    }
}