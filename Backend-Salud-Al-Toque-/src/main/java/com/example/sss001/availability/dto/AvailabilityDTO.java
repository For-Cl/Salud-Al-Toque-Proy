package com.example.sss001.availability.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {

    private Long id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private Long professionalId;
}