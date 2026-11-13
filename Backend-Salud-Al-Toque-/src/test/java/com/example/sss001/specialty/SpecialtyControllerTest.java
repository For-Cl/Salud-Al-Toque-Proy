package com.example.sss001.specialty;

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
class SpecialtyControllerTest extends AbstractContainerBaseTest {

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
    void shouldAllowGetSpecialtiesWithoutToken() throws Exception {

        mockMvc.perform(get("/specialties"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowGetSpecialtyByIdWithoutToken() throws Exception {

        mockMvc.perform(get("/specialties/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForNonExistingSpecialty() throws Exception {

        mockMvc.perform(get("/specialties/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldAllowAuthenticatedPatientToGetSpecialties() throws Exception {

        mockMvc.perform(get("/specialties")
                        .header("Authorization", "Bearer " + patientToken()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowAuthenticatedProfessionalToGetSpecialties() throws Exception {

        mockMvc.perform(get("/specialties")
                        .header("Authorization", "Bearer " + professionalToken()))
                .andExpect(status().isOk());
    }
}