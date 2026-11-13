package com.example.sss001.appointment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private Long id;
    private String date;
    private String time;
    private String status;
    private String notes;
    private Double price;
    private Long patientId;
    private Long professionalId;
    private Long medicalServiceId;
    private String patientName;
    private String professionalName;
    private String medicalServiceName;
    private String patientEmail;
    private String patientPhone;
    private String patientAddress;
    private String patientDateOfBirth;

    public AppointmentDTO(
            Long id,
            String date,
            String time,
            String status,
            String notes,
            Double price,
            Long patientId,
            Long professionalId,
            Long medicalServiceId
    ) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.status = status;
        this.notes = notes;
        this.price = price;
        this.patientId = patientId;
        this.professionalId = professionalId;
        this.medicalServiceId = medicalServiceId;
    }
}