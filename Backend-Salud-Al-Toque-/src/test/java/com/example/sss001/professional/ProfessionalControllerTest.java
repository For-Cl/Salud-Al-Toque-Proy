package com.example.sss001.professional;

import com.example.sss001.AbstractContainerBaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfessionalControllerTest extends AbstractContainerBaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAllowGetProfessionalsWithoutToken() throws Exception {

        mockMvc.perform(get("/professionals"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnProfessionalsBySpecialty() throws Exception {

        mockMvc.perform(get("/professionals")
                        .param("specialty", "Cardiologia"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnProfessionalsByLocation() throws Exception {

        mockMvc.perform(get("/professionals")
                        .param("location", "Lima"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnProfessionalsByMaximumPrice() throws Exception {

        mockMvc.perform(get("/professionals")
                        .param("maxPrice", "80"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnProfessionalsUsingCombinedFilters() throws Exception {

        mockMvc.perform(get("/professionals")
                        .param("specialty", "Cardiologia")
                        .param("location", "Lima")
                        .param("maxPrice", "100"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnProfessionalById() throws Exception {

        mockMvc.perform(get("/professionals/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForNonExistingProfessional() throws Exception {

        mockMvc.perform(get("/professionals/99999"))
                .andExpect(status().isNotFound());
    }
}