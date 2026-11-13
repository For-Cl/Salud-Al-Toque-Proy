package com.example.sss001.appointment.infrastructure;

import com.example.sss001.appointment.domain.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByProfessionalId(Long professionalId);

    List<Appointment> findByPatientUserEmail(String email);

    List<Appointment> findByProfessionalUserEmail(String email);

    boolean existsByProfessionalIdAndDateAndTime(
            Long professionalId,
            String date,
            String time
    );
}