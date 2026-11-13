package com.example.sss001.patient.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private Long id;

    private String name;

    private String email;

    private String address;

    private LocalDate dateOfBirth;

    private Long userId;
}