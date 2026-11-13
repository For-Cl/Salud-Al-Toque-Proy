package com.example.sss001.review.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    private Long id;
    private Integer rating;
    private String comment;
    private Long appointmentId;
    private Long patientId;
    private Long professionalId;
    private String patientName;

    public ReviewDTO(
            Long id,
            Integer rating,
            String comment,
            Long appointmentId,
            Long patientId,
            Long professionalId
    ) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.professionalId = professionalId;
    }
}