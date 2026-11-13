package com.example.sss001.favorite;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.auth.components.JwtService;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FavoriteControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Test
    void shouldReturn401WithoutToken() throws Exception {

        mockMvc.perform(
                        get("/favorites/my-favorites")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn403WhenProfessionalGetsFavorites()
            throws Exception {

        User professional = userRepository.findAll()
                .stream()
                .filter(user ->
                        "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        professional.getEmail());

        mockMvc.perform(
                        get("/favorites/my-favorites")
                                .header(
                                        "Authorization",
                                        "Bearer " + token)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPatientToGetFavorites()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user ->
                        "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        patient.getEmail());

        mockMvc.perform(
                        get("/favorites/my-favorites")
                                .header(
                                        "Authorization",
                                        "Bearer " + token)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectNonExistingProfessional()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user ->
                        "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        patient.getEmail());

        mockMvc.perform(
                        post("/favorites/professional/9999")
                                .header(
                                        "Authorization",
                                        "Bearer " + token)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isNotFound());
    }
}