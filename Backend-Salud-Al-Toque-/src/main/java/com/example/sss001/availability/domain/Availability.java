package com.example.sss001.availability.domain;

import com.example.sss001.professional.domain.Professional;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "availabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dayOfWeek;

    private String startTime;

    private String endTime;

    @ManyToOne
    @JoinColumn(name = "professional_id")
    private Professional professional;
}