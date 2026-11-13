package com.example.sss001.appointment.domain;

import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.professional.domain.Professional;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;

    private String time;

    private String status;

    private String notes;

    private Double price;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "professional_id")
    private Professional professional;

    @ManyToOne
    @JoinColumn(name = "medical_service_id")
    private MedicalService medicalService;
}