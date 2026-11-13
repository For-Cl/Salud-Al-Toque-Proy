package com.example.sss001.medicalservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalServiceDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long professionalId;
}