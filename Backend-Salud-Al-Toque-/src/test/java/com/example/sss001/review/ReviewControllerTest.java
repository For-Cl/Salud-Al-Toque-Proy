package com.example.sss001.review;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.auth.components.JwtService;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReviewControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String tokenFor(String role) {

        User user = userRepository.findAll()
                .stream()
                .filter(u -> role.equals(u.getRole()))
                .findFirst()
                .orElseThrow();

        return jwtService.generateToken(user.getEmail());
    }

    private String createReviewRequestJson(
            Long appointmentId,
            Integer rating,
            String comment) {

        return """
                {
                  "appointmentId": %s,
                  "rating": %s,
                  "comment": "%s"
                }
                """.formatted(appointmentId, rating, comment);
    }

    // =========================================================
    // GET /reviews
    // =========================================================

    @Test
    void shouldReturnAllReviewsWithoutAuthentication() throws Exception {

        mockMvc.perform(
                        get("/reviews")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturn404WhenReviewDoesNotExist() throws Exception {

        mockMvc.perform(
                        get("/reviews/9999")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnEmptyListForProfessionalWithoutReviews() throws Exception {

        mockMvc.perform(
                        get("/reviews/professional/1")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // =========================================================
    // POST /reviews
    // =========================================================

    @Test
    void shouldReturn401WhenCreatingReviewWithoutToken() throws Exception {

        String requestBody =
                createReviewRequestJson(1L, 5, "Excelente atencion");

        mockMvc.perform(
                        post("/reviews")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn403WhenProfessionalTriesToCreateReview() throws Exception {

        String requestBody =
                createReviewRequestJson(1L, 5, "Excelente atencion");

        String token = tokenFor("PROFESSIONAL");

        mockMvc.perform(
                        post("/reviews")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturn404WhenAppointmentDoesNotExist() throws Exception {

        String requestBody =
                createReviewRequestJson(9999L, 5, "Excelente atencion");

        String token = tokenFor("PATIENT");

        mockMvc.perform(
                        post("/reviews")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn403WhenAppointmentIsNotCompleted() throws Exception {

        // La cita sembrada en data.sql (id=1) tiene estado PENDIENTE,
        // por lo que no debería poder reseñarse todavía.

        String requestBody =
                createReviewRequestJson(1L, 5, "Excelente atencion");

        String token = tokenFor("PATIENT");

        mockMvc.perform(
                        post("/reviews")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void  shouldReturn400WhenRatingIsOutOfRange() throws Exception {

        // Se usa una cita inexistente para el paciente, pero antes de
        // llegar a esa verificación el controller no valida el rating,
        // por lo que se prueba el flujo de validación con un id existente
        // y un rating inválido, esperando el error correspondiente al
        // primer chequeo que falle (cita no completada -> 403).
        // Este test documenta el comportamiento actual del validador de rating
        // cuando la cita sí pertenece al paciente pero no está completada.

        String requestBody =
                createReviewRequestJson(1L, 10, "Rating fuera de rango");

        String token = tokenFor("PATIENT");

        mockMvc.perform(
                        post("/reviews")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }
}