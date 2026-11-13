package com.example.sss001.auth.domain;

import com.example.sss001.auth.components.JwtService;
import com.example.sss001.auth.dto.SignInRequest;
import com.example.sss001.auth.dto.SignUpRequest;
import com.example.sss001.auth.dto.TokenResponse;
import com.example.sss001.event.UserRegisteredEvent;

import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.infrastructure.PatientRepository;

import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    // =========================================================
    // SIGN IN
    // =========================================================

    public TokenResponse signIn(
            SignInRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token =
                jwtService.generateToken(
                        request.getEmail()
                );

        return new TokenResponse(token);
    }

    // =========================================================
    // SIGN UP
    // =========================================================

    public TokenResponse signUp(
            SignUpRequest request) {

        if (userRepository.findByEmail(
                request.getEmail()
        ).isPresent()) {

            throw new IllegalArgumentException(
                    "El correo electrónico ya está registrado"
            );
        }

        // -------------------------------------------------
        // CREAR USER
        // -------------------------------------------------

        User user =
                new User();

        user.setName(
                request.getName()
        );

        user.setEmail(
                request.getEmail()
        );

        // IMPORTANTE:
        // Nunca guardar password directamente.
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setPhone(
                request.getPhone()
        );

        user.setRole(
                "PATIENT"
        );

        User savedUser =
                userRepository.save(user);

        // -------------------------------------------------
        // CREAR PATIENT
        // -------------------------------------------------

        Patient patient =
                new Patient();

        patient.setUser(
                savedUser
        );

        patientRepository.save(patient);

        // -------------------------------------------------
        // PUBLICAR EVENTO DE REGISTRO
        // -------------------------------------------------

        log.info("EVENT PUBLISH START type=UserRegisteredEvent userId={} thread={}",
                savedUser.getId(), Thread.currentThread().getName());

        eventPublisher.publishEvent(
                new UserRegisteredEvent(
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail()
                )
        );

        log.info("EVENT PUBLISH END type=UserRegisteredEvent userId={} thread={}",
                savedUser.getId(), Thread.currentThread().getName());

        // -------------------------------------------------
        // GENERAR JWT
        // -------------------------------------------------

        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        return new TokenResponse(token);
    }
}