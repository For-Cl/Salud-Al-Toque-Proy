package com.example.sss001.review.application;

import com.example.sss001.appointment.domain.Appointment;
import com.example.sss001.appointment.domain.AppointmentService;
import com.example.sss001.exceptions.ConflictException;
import com.example.sss001.exceptions.ForbiddenException;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.domain.PatientService;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.review.domain.Review;
import com.example.sss001.review.domain.ReviewService;
import com.example.sss001.review.dto.CreateReviewRequest;
import com.example.sss001.review.dto.ReviewDTO;
import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.event.ReviewCreatedEvent;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService service;
    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final ProfessionalService professionalService;
    private final ApplicationEventPublisher eventPublisher;

    public ReviewController(
            ReviewService service,
            AppointmentService appointmentService,
            PatientService patientService,
            ProfessionalService professionalService,
            ApplicationEventPublisher eventPublisher) {

        this.service = service;
        this.appointmentService = appointmentService;
        this.patientService = patientService;
        this.professionalService = professionalService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public List<ReviewDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ReviewDTO findById(
            @PathVariable Long id) {

        Review review =
                service.findById(id);

        if (review == null) {
            throw new ResourceNotFoundException(
                    "Reseña no encontrada"
            );
        }

        return convertToDTO(review);
    }

    @GetMapping("/professional/{professionalId}")
    public List<ReviewDTO> findByProfessional(
            @PathVariable Long professionalId) {

        return service
                .findByProfessionalId(professionalId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ReviewDTO save(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        String email =
                authentication.getName();

        Patient patient =
                patientService.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        Appointment appointment =
                appointmentService.findById(
                        request.getAppointmentId()
                );

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        if (appointment.getPatient() == null ||
                !appointment.getPatient()
                        .getId()
                        .equals(patient.getId())) {

            throw new ForbiddenException(
                    "No puedes reseñar una cita de otro paciente"
            );
        }

        if (!"COMPLETADA".equals(
                appointment.getStatus())) {

            throw new ForbiddenException(
                    "Solo puedes reseñar una cita completada"
            );
        }

        if (service.existsByAppointmentId(
                appointment.getId())) {

            throw new ConflictException(
                    "Esta cita ya tiene una reseña"
            );
        }

        if (request.getRating() == null ||
                request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new ConflictException(
                    "La calificación debe estar entre 1 y 5"
            );
        }

        Professional professional =
                appointment.getProfessional();

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "La cita no tiene profesional asociado"
            );
        }

        Review review =
                new Review();

        review.setRating(
                request.getRating()
        );

        review.setComment(
                request.getComment()
        );

        review.setAppointment(
                appointment
        );

        review.setPatient(
                patient
        );

        review.setProfessional(
                professional
        );

        Review saved =
                service.save(review);

        actualizarRating(professional);

        String professionalName =
                professional.getUser() != null
                        ? professional.getUser().getName()
                        : "Profesional";

        String professionalEmail =
                professional.getUser() != null
                        ? professional.getUser().getEmail()
                        : null;

        String patientName =
                patient.getUser() != null
                        ? patient.getUser().getName()
                        : "Paciente";

        log.info("EVENT PUBLISH START type=ReviewCreatedEvent reviewId={} thread={}",
                saved.getId(), Thread.currentThread().getName());

        eventPublisher.publishEvent(
                new ReviewCreatedEvent(
                        saved.getId(),
                        professionalName,
                        professionalEmail,
                        patientName,
                        saved.getRating(),
                        saved.getComment()
                )
        );

        log.info("EVENT PUBLISH END type=ReviewCreatedEvent reviewId={} thread={}",
                saved.getId(), Thread.currentThread().getName());

        return convertToDTO(saved);
    }

    private void actualizarRating(
            Professional professional) {

        List<Review> reviews =
                service.findByProfessionalId(
                        professional.getId()
                );

        if (reviews.isEmpty()) {

            professional.setRating(0.0);

        } else {

            double average =
                    reviews.stream()
                            .mapToInt(
                                    Review::getRating
                            )
                            .average()
                            .orElse(0.0);

            double rounded =
                    Math.round(
                            average * 10.0
                    ) / 10.0;

            professional.setRating(
                    rounded
            );
        }

        professionalService.save(
                professional
        );
    }

    private ReviewDTO convertToDTO(
            Review review) {

        Long appointmentId = null;
        Long patientId = null;
        Long professionalId = null;
        String patientName = null;

        if (review.getAppointment() != null) {
            appointmentId =
                    review.getAppointment().getId();
        }

        if (review.getPatient() != null) {
            patientId =
                    review.getPatient().getId();
            if (review.getPatient().getUser() != null) {
                patientName = review.getPatient().getUser().getName();
            }
        }

        if (review.getProfessional() != null) {
            professionalId =
                    review.getProfessional().getId();
        }

        ReviewDTO dto = new ReviewDTO(
                review.getId(),
                review.getRating(),
                review.getComment(),
                appointmentId,
                patientId,
                professionalId
        );
        dto.setPatientName(patientName);

        return dto;
    }
}