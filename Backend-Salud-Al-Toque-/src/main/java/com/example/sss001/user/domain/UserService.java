package com.example.sss001.user.domain;

import com.example.sss001.appointment.domain.Appointment;
import com.example.sss001.appointment.infrastructure.AppointmentRepository;
import com.example.sss001.availability.infrastructure.AvailabilityRepository;
import com.example.sss001.favorite.infrastructure.FavoriteRepository;
import com.example.sss001.medicalservice.infrastructure.MedicalServiceRepository;
import com.example.sss001.patient.infrastructure.PatientRepository;
import com.example.sss001.professional.infrastructure.ProfessionalRepository;
import com.example.sss001.review.infrastructure.ReviewRepository;
import com.example.sss001.user.infrastructure.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final AvailabilityRepository availabilityRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    public UserService(
            UserRepository repository,
            PatientRepository patientRepository,
            ProfessionalRepository professionalRepository,
            AppointmentRepository appointmentRepository,
            ReviewRepository reviewRepository,
            FavoriteRepository favoriteRepository,
            AvailabilityRepository availabilityRepository,
            MedicalServiceRepository medicalServiceRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.professionalRepository = professionalRepository;
        this.appointmentRepository = appointmentRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.availabilityRepository = availabilityRepository;
        this.medicalServiceRepository = medicalServiceRepository;
    }

    public List<User> findAll() {
        return repository.findAll();
    }

    public User findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public User save(User user) {
        return repository.save(user);
    }

    @Transactional
    public void delete(Long id) {
        // 1. Eliminar datos asociados a perfil de paciente si existe
        if (patientRepository != null) {
            patientRepository.findByUserId(id).ifPresent(patient -> {
                if (favoriteRepository != null) {
                    favoriteRepository.deleteByPatientId(patient.getId());
                }
                if (appointmentRepository != null) {
                    List<Appointment> patientAppointments = appointmentRepository.findByPatientId(patient.getId());
                    if (patientAppointments != null && reviewRepository != null) {
                        for (Appointment apt : patientAppointments) {
                            reviewRepository.deleteByAppointmentId(apt.getId());
                        }
                    }
                    appointmentRepository.deleteByPatientId(patient.getId());
                }
                if (reviewRepository != null) {
                    reviewRepository.deleteByPatientId(patient.getId());
                }
                patientRepository.delete(patient);
            });
        }

        // 2. Eliminar datos asociados a perfil de profesional si existe
        if (professionalRepository != null) {
            professionalRepository.findByUserId(id).ifPresent(professional -> {
                if (favoriteRepository != null) {
                    favoriteRepository.deleteByProfessionalId(professional.getId());
                }
                if (appointmentRepository != null) {
                    List<Appointment> profAppointments = appointmentRepository.findByProfessionalId(professional.getId());
                    if (profAppointments != null && reviewRepository != null) {
                        for (Appointment apt : profAppointments) {
                            reviewRepository.deleteByAppointmentId(apt.getId());
                        }
                    }
                    appointmentRepository.deleteByProfessionalId(professional.getId());
                }
                if (reviewRepository != null) {
                    reviewRepository.deleteByProfessionalId(professional.getId());
                }
                if (medicalServiceRepository != null) {
                    medicalServiceRepository.deleteByProfessionalId(professional.getId());
                }
                if (availabilityRepository != null) {
                    availabilityRepository.deleteByProfessionalId(professional.getId());
                }
                professionalRepository.delete(professional);
            });
        }

        // 3. Eliminar usuario final
        repository.deleteById(id);
    }
}
