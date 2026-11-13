package com.example.sss001.favorite.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {

    private Long id;
    private Long patientId;
    private Long professionalId;
    private String professionalName;
    private String specialty;
    private String location;
    private Double rating;
}