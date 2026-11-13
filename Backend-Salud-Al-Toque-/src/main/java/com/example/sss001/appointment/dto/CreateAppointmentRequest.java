package com.example.sss001.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {

    @NotBlank(message = "La fecha es obligatoria")
    private String date;

    @NotBlank(message = "La hora es obligatoria")
    private String time;

    @Size(max = 500, message = "Las notas no pueden superar 500 caracteres")
    private String notes;

    @NotNull(message = "El servicio médico es obligatorio")
    private Long medicalServiceId;
}