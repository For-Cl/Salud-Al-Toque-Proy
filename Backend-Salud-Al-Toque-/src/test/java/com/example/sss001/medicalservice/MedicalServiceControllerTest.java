package com.example.sss001.medicalservice;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.auth.components.JwtService;
import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.medicalservice.infrastructure.MedicalServiceRepository;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.infrastructure.ProfessionalRepository;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MedicalServiceControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfessionalRepository professionalRepository;

    @Autowired
    private MedicalServiceRepository medicalServiceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String patientToken() {
        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(patient.getEmail());
    }

    private String professionalToken() {
        User professional = userRepository.findAll()
                .stream()
                .filter(user -> "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(professional.getEmail());
    }

    @Test
    void shouldAllowGetMedicalServicesWithoutToken() throws Exception {

        mockMvc.perform(get("/medical-services"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowGetMedicalServiceByIdWithoutToken() throws Exception {

        mockMvc.perform(get("/medical-services/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForNonExistingMedicalService() throws Exception {

        mockMvc.perform(get("/medical-services/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectPostWithoutAuthentication() throws Exception {

        String json = """
                {
                    "name": "Consulta general",
                    "description": "Consulta médica",
                    "price": 80.0,
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/medical-services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPostForPatient() throws Exception {

        String json = """
                {
                    "name": "Consulta general",
                    "description": "Consulta médica",
                    "price": 80.0,
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/medical-services")
                        .header("Authorization", "Bearer " + patientToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowProfessionalToCreateMedicalService() throws Exception {

        String json = """
                {
                    "name": "Consulta de control",
                    "description": "Control médico",
                    "price": 90.0,
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/medical-services")
                        .header("Authorization", "Bearer " + professionalToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void shouldIgnoreClientSuppliedProfessionalId() throws Exception {

        String json = """
            {
                "name": "Consulta",
                "description": "Consulta médica",
                "price": 80.0,
                "professionalId": 99999
            }
            """;

        mockMvc.perform(post("/medical-services")
                        .header("Authorization", "Bearer " + professionalToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.professionalId").value(org.hamcrest.Matchers.not(99999)));
    }
}