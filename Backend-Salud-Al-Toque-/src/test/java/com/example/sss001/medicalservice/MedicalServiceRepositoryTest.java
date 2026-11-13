package com.example.sss001.medicalservice;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.medicalservice.domain.MedicalService;
import com.example.sss001.medicalservice.infrastructure.MedicalServiceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MedicalServiceRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private MedicalServiceRepository medicalServiceRepository;

    @Test
    void shouldFindMedicalServicesByProfessionalId() {

        List<MedicalService> medicalServices =
                medicalServiceRepository.findByProfessionalId(1L);

        assertFalse(medicalServices.isEmpty());

        assertEquals(
                1L,
                medicalServices.get(0)
                        .getProfessional()
                        .getId()
        );
    }

    @Test
    void shouldReturnEmptyForProfessionalWithoutServices() {

        List<MedicalService> medicalServices =
                medicalServiceRepository.findByProfessionalId(9999L);

        assertTrue(medicalServices.isEmpty());
    }

    @Test
    void shouldSaveAndRetrieveMedicalService() {

        MedicalService medicalService = new MedicalService();
        medicalService.setName("Consulta de prueba");
        medicalService.setDescription("Descripcion de prueba");
        medicalService.setPrice(50.0);

        MedicalService saved =
                medicalServiceRepository.save(medicalService);

        assertNotNull(saved.getId());

        MedicalService found =
                medicalServiceRepository.findById(saved.getId())
                        .orElse(null);

        assertNotNull(found);
        assertEquals("Consulta de prueba", found.getName());
        assertEquals(50.0, found.getPrice());
    }
}
