package com.example.sss001.availability;

import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.auth.components.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AvailabilityControllerTest extends AbstractContainerBaseTest {

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

    private String professionalToken() {
        User professional = userRepository.findAll()
                .stream()
                .filter(user -> "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(professional.getEmail());
    }

    @Test
    void shouldAllowGetAvailabilitiesWithoutToken() throws Exception {

        mockMvc.perform(get("/availabilities"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowGetAvailabilityByIdWithoutToken() throws Exception {

        mockMvc.perform(get("/availabilities/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForNonExistingAvailability() throws Exception {

        mockMvc.perform(get("/availabilities/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectPostWithoutAuthentication() throws Exception {

        String json = """
                {
                    "dayOfWeek": "Friday",
                    "startTime": "09:00",
                    "endTime": "13:00",
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/availabilities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPostForPatient() throws Exception {

        String json = """
                {
                    "dayOfWeek": "Friday",
                    "startTime": "09:00",
                    "endTime": "13:00",
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/availabilities")
                        .header("Authorization", "Bearer " + patientToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowProfessionalToCreateAvailability() throws Exception {

        String json = """
                {
                    "dayOfWeek": "Friday",
                    "startTime": "09:00",
                    "endTime": "13:00",
                    "professionalId": 1
                }
                """;

        mockMvc.perform(post("/availabilities")
                        .header("Authorization", "Bearer " + professionalToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void shouldIgnoreClientSuppliedProfessionalId() throws Exception {

        String json = """
            {
                "dayOfWeek": "Friday",
                "startTime": "09:00",
                "endTime": "13:00",
                "professionalId": 99999
            }
            """;

        mockMvc.perform(post("/availabilities")
                        .header("Authorization", "Bearer " + professionalToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.professionalId").value(org.hamcrest.Matchers.not(99999)));
    }
}