package com.example.sss001.auth;

import com.example.sss001.auth.components.JwtService;
import com.example.sss001.auth.domain.AuthService;
import com.example.sss001.auth.dto.SignInRequest;
import com.example.sss001.auth.dto.SignUpRequest;
import com.example.sss001.auth.dto.TokenResponse;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.infrastructure.PatientRepository;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldSignInSuccessfully() {

        SignInRequest request = new SignInRequest();
        request.setEmail("pedro@gmail.com");
        request.setPassword("123456");

        when(jwtService.generateToken("pedro@gmail.com"))
                .thenReturn("TOKEN_TEST");

        TokenResponse response =
                authService.signIn(request);

        assertNotNull(response);
        assertEquals("TOKEN_TEST", response.getToken());

        verify(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        verify(jwtService)
                .generateToken("pedro@gmail.com");
    }

    @Test
    void shouldRegisterPatientSuccessfully() {

        SignUpRequest request = new SignUpRequest();

        request.setName("Nuevo Paciente");
        request.setEmail("nuevo@gmail.com");
        request.setPassword("123456");
        request.setPhone("999999999");

        when(userRepository.findByEmail("nuevo@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("123456"))
                .thenReturn("PASSWORD_ENCRIPTADO");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setName("Nuevo Paciente");
        savedUser.setEmail("nuevo@gmail.com");
        savedUser.setPassword("PASSWORD_ENCRIPTADO");
        savedUser.setPhone("999999999");
        savedUser.setRole("PATIENT");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(jwtService.generateToken("nuevo@gmail.com"))
                .thenReturn("TOKEN_NUEVO");

        TokenResponse response =
                authService.signUp(request);

        assertNotNull(response);
        assertEquals("TOKEN_NUEVO", response.getToken());

        verify(userRepository)
                .save(any(User.class));

        verify(patientRepository)
                .save(any(Patient.class));

        verify(eventPublisher)
                .publishEvent(any(com.example.sss001.event.UserRegisteredEvent.class));

        verify(passwordEncoder)
                .encode("123456");

        verify(jwtService)
                .generateToken("nuevo@gmail.com");
    }

    @Test
    void shouldRejectDuplicateEmail() {

        SignUpRequest request = new SignUpRequest();

        request.setName("Pedro");
        request.setEmail("pedro@gmail.com");
        request.setPassword("123456");
        request.setPhone("999999999");

        User existingUser = new User();

        when(userRepository.findByEmail("pedro@gmail.com"))
                .thenReturn(Optional.of(existingUser));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.signUp(request)
                );

        assertEquals(
                "El correo electrónico ya está registrado",
                exception.getMessage()
        );

        verify(userRepository, never())
                .save(any(User.class));

        verify(patientRepository, never())
                .save(any(Patient.class));

        verify(jwtService, never())
                .generateToken(any());
    }
}