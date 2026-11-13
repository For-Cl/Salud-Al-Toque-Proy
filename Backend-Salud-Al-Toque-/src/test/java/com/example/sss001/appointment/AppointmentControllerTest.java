package com.example.sss001.appointment;

import org.springframework.transaction.annotation.Transactional;
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
import tools.jackson.databind.json.JsonMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JsonMapper objectMapper;

    @Test
    void shouldReturn401WhenGettingAppointmentsWithoutToken()
            throws Exception {

        mockMvc.perform(
                        get("/appointments")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn403WhenPatientGetsAllAppointments()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        mockMvc.perform(
                        get("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPatientToGetOwnAppointments()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        mockMvc.perform(
                        get("/appointments/my-appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowProfessionalToGetOwnAppointments()
            throws Exception {

        User professional = userRepository.findAll()
                .stream()
                .filter(user -> "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        professional.getEmail()
                );

        mockMvc.perform(
                        get("/appointments/my-professional-appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowAdminToGetAllAppointments()
            throws Exception {

        User admin = userRepository.findAll()
                .stream()
                .filter(user -> "ADMIN".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(admin.getEmail());

        mockMvc.perform(
                        get("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectAppointmentCreationWithoutToken()
            throws Exception {

        String json = """
        {
            "date": "2026-10-06",
            "time": "10:30",
            "notes": "Consulta de prueba",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isUnauthorized());
    }
    @Test
    void shouldRejectAppointmentCreationByProfessional()
            throws Exception {

        User professional = userRepository.findAll()
                .stream()
                .filter(user -> "PROFESSIONAL".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        professional.getEmail()
                );

        String json = """
        {
            "date": "2026-10-06",
            "time": "10:30",
            "notes": "Consulta de prueba",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isForbidden());
    }
    @Test
    void shouldAllowPatientToCreateAppointment()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(
                        patient.getEmail()
                );

        String json = """
        {
            "date": "2026-10-12",
            "time": "10:30",
            "notes": "Consulta de prueba automática",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated());
    }
    @Test
    void shouldRejectDuplicatedAppointment()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        String json = """
        {
            "date": "2026-10-05",
            "time": "10:30",
            "notes": "Cita duplicada",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isConflict());
    }
    @Test
    void shouldRejectAppointmentWithInvalidMedicalService()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        String json = """
        {
            "date": "2026-10-12",
            "time": "11:30",
            "notes": "Servicio inexistente",
            "medicalServiceId": 9999
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isNotFound());
    }
    @Test
    void shouldRejectAppointmentOutsideAvailability()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        String json = """
        {
            "date": "2026-10-12",
            "time": "14:00",
            "notes": "Horario no disponible",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isConflict());
    }
    @Test
    void shouldRejectInvalidAppointmentDate()
            throws Exception {

        User patient = userRepository.findAll()
                .stream()
                .filter(user -> "PATIENT".equals(user.getRole()))
                .findFirst()
                .orElseThrow();

        String token =
                jwtService.generateToken(patient.getEmail());

        String json = """
        {
            "date": "fecha-invalida",
            "time": "10:30",
            "notes": "Fecha inválida",
            "medicalServiceId": 1
        }
        """;

        mockMvc.perform(
                        post("/appointments")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isConflict());
    }
}