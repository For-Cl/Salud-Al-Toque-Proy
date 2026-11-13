package com.example.sss001.appointment.application;

import com.example.sss001.appointment.domain.Appointment;
import com.example.sss001.appointment.domain.AppointmentService;
import com.example.sss001.appointment.dto.AppointmentDTO;
import com.example.sss001.appointment.dto.CreateAppointmentRequest;
import com.example.sss001.exceptions.ConflictException;
import com.example.sss001.exceptions.ForbiddenException;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.domain.PatientService;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.medicalservice.domain.MedicalServiceManager;
import com.example.sss001.availability.domain.Availability;
import com.example.sss001.availability.domain.AvailabilityService;
import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.event.AppointmentCreatedEvent;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private static final Logger log = LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentService service;
    private final PatientService patientService;
    private final ProfessionalService professionalService;
    private final MedicalServiceManager medicalServiceManager;
    private final AvailabilityService availabilityService;
    private final ApplicationEventPublisher eventPublisher;

    public AppointmentController(
            AppointmentService service,
            PatientService patientService,
            ProfessionalService professionalService,
            MedicalServiceManager medicalServiceManager,
            AvailabilityService availabilityService,
            ApplicationEventPublisher eventPublisher) {

        this.service = service;
        this.patientService = patientService;
        this.professionalService = professionalService;
        this.medicalServiceManager = medicalServiceManager;
        this.availabilityService = availabilityService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppointmentDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppointmentDTO> findByPatient(
            @PathVariable Long patientId) {

        return service.findByPatientId(patientId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/professional/{professionalId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppointmentDTO> findByProfessional(
            @PathVariable Long professionalId) {

        return service.findByProfessionalId(professionalId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }



    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public List<AppointmentDTO> myAppointments(
            Authentication authentication) {

        String email = authentication.getName();

        return service.findByPatientEmail(email)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentDTO save(
            @Valid @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Patient patient =
                patientService.findByUserEmail(email);

        if (patient == null) {
            throw new ResourceNotFoundException(
                    "Paciente no encontrado"
            );
        }

        MedicalService medicalService =
                medicalServiceManager.findById(
                        request.getMedicalServiceId()
                );

        if (medicalService == null) {
            throw new ResourceNotFoundException(
                    "Servicio médico no encontrado"
            );
        }

        Professional professional =
                medicalService.getProfessional();

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "El servicio no tiene un profesional asociado"
            );
        }

        LocalDate appointmentDate;

        try {
            appointmentDate =
                    LocalDate.parse(request.getDate());

        } catch (Exception e) {

            throw new ConflictException(
                    "La fecha debe tener formato YYYY-MM-DD"
            );
        }

        LocalTime appointmentTime;

        try {
            appointmentTime =
                    LocalTime.parse(request.getTime());

        } catch (Exception e) {

            throw new ConflictException(
                    "La hora debe tener formato HH:mm"
            );
        }

        String dayOfWeek =
                obtenerDiaEnEspanol(
                        appointmentDate.getDayOfWeek()
                );

        List<Availability> availabilities =
                availabilityService
                        .findByProfessionalAndDay(
                                professional.getId(),
                                dayOfWeek
                        );

        boolean available = false;

        for (Availability availability : availabilities) {

            LocalTime start =
                    LocalTime.parse(
                            availability.getStartTime()
                    );

            LocalTime end =
                    LocalTime.parse(
                            availability.getEndTime()
                    );

            if (!appointmentTime.isBefore(start)
                    && appointmentTime.isBefore(end)) {

                available = true;
                break;
            }
        }

        if (!available) {

            throw new ConflictException(
                    "El profesional no está disponible en esa fecha y hora"
            );
        }

        boolean alreadyBooked =
                service.existsByProfessionalAndDateAndTime(
                        professional.getId(),
                        request.getDate(),
                        request.getTime()
                );

        if (alreadyBooked) {

            throw new ConflictException(
                    "El horario seleccionado ya está reservado"
            );
        }

        Appointment appointment =
                new Appointment();

        appointment.setDate(
                request.getDate()
        );

        appointment.setTime(
                request.getTime()
        );

        appointment.setNotes(
                request.getNotes()
        );

        appointment.setStatus(
                "PENDIENTE"
        );

        appointment.setPatient(
                patient
        );

        appointment.setProfessional(
                professional
        );

        appointment.setMedicalService(
                medicalService
        );

        appointment.setPrice(
                medicalService.getPrice()
        );

        Appointment saved =
                service.save(appointment);

        String patientName =
                patient.getUser() != null
                        ? patient.getUser().getName()
                        : "Paciente";

        String patientEmail =
                patient.getUser() != null
                        ? patient.getUser().getEmail()
                        : null;

        String professionalName =
                professional.getUser() != null
                        ? professional.getUser().getName()
                        : "Profesional";

        String professionalEmail =
                professional.getUser() != null
                        ? professional.getUser().getEmail()
                        : null;

        String medicalServiceName =
                medicalService.getName();

        log.info("EVENT PUBLISH START type=AppointmentCreatedEvent appointmentId={} thread={}",
                saved.getId(), Thread.currentThread().getName());

        eventPublisher.publishEvent(
                new AppointmentCreatedEvent(
                        saved.getId(),
                        saved.getDate(),
                        saved.getTime(),
                        patientName,
                        patientEmail,
                        professionalName,
                        professionalEmail,
                        medicalServiceName,
                        saved.getPrice()
                )
        );

        log.info("EVENT PUBLISH END type=AppointmentCreatedEvent appointmentId={} thread={}",
                saved.getId(), Thread.currentThread().getName());

        return convertToDTO(saved);
    }

    @GetMapping("/my-professional-appointments")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public List<AppointmentDTO> myProfessionalAppointments(
            Authentication authentication) {

        String email = authentication.getName();

        return service.findByProfessionalEmail(email)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AppointmentDTO findById(
            @PathVariable Long id) {

        Appointment appointment =
                service.findById(id);

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        return convertToDTO(appointment);
    }


    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public AppointmentDTO accept(
            @PathVariable Long id,
            Authentication authentication) {

        Professional professional =
                professionalService.findByUserEmail(
                        authentication.getName()
                );

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        Appointment appointment =
                service.findById(id);

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        verificarPropietario(
                appointment,
                professional
        );

        if (!"PENDIENTE".equals(
                appointment.getStatus())) {

            throw new ConflictException(
                    "Solo se pueden aceptar citas pendientes"
            );
        }

        appointment.setStatus("ACEPTADA");

        Appointment updated =
                service.save(appointment);

        return convertToDTO(updated);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public AppointmentDTO reject(
            @PathVariable Long id,
            Authentication authentication) {

        Professional professional =
                professionalService.findByUserEmail(
                        authentication.getName()
                );

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        Appointment appointment =
                service.findById(id);

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        verificarPropietario(
                appointment,
                professional
        );

        if (!"PENDIENTE".equals(
                appointment.getStatus())) {

            throw new ConflictException(
                    "Solo se pueden rechazar citas pendientes"
            );
        }

        appointment.setStatus("RECHAZADA");

        Appointment updated =
                service.save(appointment);

        return convertToDTO(updated);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public AppointmentDTO complete(
            @PathVariable Long id,
            Authentication authentication) {

        Professional professional =
                professionalService.findByUserEmail(
                        authentication.getName()
                );

        if (professional == null) {
            throw new ResourceNotFoundException(
                    "Profesional no encontrado"
            );
        }

        Appointment appointment =
                service.findById(id);

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        verificarPropietario(
                appointment,
                professional
        );

        if (!"ACEPTADA".equals(
                appointment.getStatus())) {

            throw new ConflictException(
                    "Solo se pueden completar citas aceptadas"
            );
        }

        appointment.setStatus("COMPLETADA");

        Appointment updated =
                service.save(appointment);

        return convertToDTO(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(
            @PathVariable Long id) {

        Appointment appointment =
                service.findById(id);

        if (appointment == null) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada"
            );
        }

        service.delete(id);
    }

    private void verificarPropietario(
            Appointment appointment,
            Professional professional) {

        if (appointment.getProfessional() == null
                || !appointment.getProfessional()
                .getId()
                .equals(professional.getId())) {

            throw new ForbiddenException(
                    "No puedes modificar una cita de otro profesional"
            );
        }
    }

    private String obtenerDiaEnEspanol(
            DayOfWeek day) {

        return switch (day) {

            case MONDAY ->
                    "LUNES";

            case TUESDAY ->
                    "MARTES";

            case WEDNESDAY ->
                    "MIERCOLES";

            case THURSDAY ->
                    "JUEVES";

            case FRIDAY ->
                    "VIERNES";

            case SATURDAY ->
                    "SABADO";

            case SUNDAY ->
                    "DOMINGO";
        };
    }

    private AppointmentDTO convertToDTO(
            Appointment appointment) {

        Long patientId = null;
        String patientName = null;
        String patientEmail = null;
        String patientPhone = null;
        String patientAddress = null;
        String patientDateOfBirth = null;

        if (appointment.getPatient() != null) {
            patientId =
                    appointment.getPatient().getId();
            patientAddress =
                    appointment.getPatient().getAddress();
            if (appointment.getPatient().getDateOfBirth() != null) {
                patientDateOfBirth =
                        appointment.getPatient().getDateOfBirth().toString();
            }
            if (appointment.getPatient().getUser() != null) {
                patientName = appointment.getPatient().getUser().getName();
                patientEmail = appointment.getPatient().getUser().getEmail();
                patientPhone = appointment.getPatient().getUser().getPhone();
            }
        }

        Long professionalId = null;
        String professionalName = null;

        if (appointment.getProfessional() != null) {
            professionalId =
                    appointment.getProfessional().getId();
            if (appointment.getProfessional().getUser() != null) {
                professionalName = appointment.getProfessional().getUser().getName();
            }
        }

        Long medicalServiceId = null;
        String medicalServiceName = null;

        if (appointment.getMedicalService() != null) {
            medicalServiceId =
                    appointment.getMedicalService().getId();
            medicalServiceName =
                    appointment.getMedicalService().getName();
        }

        AppointmentDTO dto = new AppointmentDTO(
                appointment.getId(),
                appointment.getDate(),
                appointment.getTime(),
                appointment.getStatus(),
                appointment.getNotes(),
                appointment.getPrice(),
                patientId,
                professionalId,
                medicalServiceId
        );
        dto.setPatientName(patientName);
        dto.setProfessionalName(professionalName);
        dto.setMedicalServiceName(medicalServiceName);
        dto.setPatientEmail(patientEmail);
        dto.setPatientPhone(patientPhone);
        dto.setPatientAddress(patientAddress);
        dto.setPatientDateOfBirth(patientDateOfBirth);

        return dto;
    }
}