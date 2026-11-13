package com.example.sss001.user;

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
class UserControllerTest extends AbstractContainerBaseTest {

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

    private String adminToken() {
        User admin = userRepository.findAll()
                .stream()
                .filter(user -> "ADMIN".equals(user.getRole()))
                .findFirst()
                .orElseThrow();
        return jwtService.generateToken(admin.getEmail());
    }

    @Test
    void shouldRejectGetUsersWithoutAuthentication() throws Exception {

        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectGetUserByIdWithoutAuthentication() throws Exception {

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPatientFromGettingUsers() throws Exception {

        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer " + patientToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectProfessionalFromGettingUsers() throws Exception {

        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer " + professionalToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminToGetUsers() throws Exception {

        mockMvc.perform(get("/users")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnUserById() throws Exception {

        mockMvc.perform(get("/users/1")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForNonExistingUser() throws Exception {

        mockMvc.perform(get("/users/99999")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isNotFound());
    }
}