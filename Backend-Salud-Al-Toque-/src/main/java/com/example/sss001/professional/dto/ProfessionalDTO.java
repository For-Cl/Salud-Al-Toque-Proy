package com.example.sss001.professional.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalDTO {

    private Long id;
    private String name;
    private String specialty;
    private String location;
    private Double price;
    private Double rating;
    private Long userId;
}