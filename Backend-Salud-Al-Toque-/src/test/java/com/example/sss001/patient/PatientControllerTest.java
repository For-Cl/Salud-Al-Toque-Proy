package com.example.sss001.patient;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.auth.components.JwtService;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PatientControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private String patientToken() {
        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(patient.getEmail());
    }

    private String adminToken() {
        User admin = userRepository.findAll()
                .stream()
                .filter(user -> "ADMIN".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(admin.getEmail());
    }

    private String professionalToken() {
        return jwtService.generateToken("carlos@gmail.com");
    }

    @Test
    void shouldRejectGetPatientsWithoutAuthentication() throws Exception {

        mockMvc.perform(get("/patients"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectGetPatientByIdWithoutAuthentication() throws Exception {

        mockMvc.perform(get("/patients/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowPatientToGetOwnInformation() throws Exception {

        mockMvc.perform(get("/patients/me")
                        .header("Authorization", "Bearer " + patientToken()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectProfessionalFromPatientInformation() throws Exception {

        mockMvc.perform(get("/patients/me")
                        .header("Authorization", "Bearer " + professionalToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturnNotFoundForNonExistingPatient() throws Exception {

        mockMvc.perform(get("/patients/99999")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isNotFound());
    }
}