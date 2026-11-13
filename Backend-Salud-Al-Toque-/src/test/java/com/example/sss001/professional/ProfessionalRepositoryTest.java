package com.example.sss001.professional;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.infrastructure.ProfessionalRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProfessionalRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private ProfessionalRepository professionalRepository;

    @Test
    void shouldFindProfessionalByUserEmail() {

        Optional<Professional> professional =
                professionalRepository.findByUserEmail("carlos@gmail.com");

        assertTrue(professional.isPresent());

        assertEquals(
                "carlos@gmail.com",
                professional.get().getUser().getEmail()
        );
    }

    @Test
    void shouldReturnEmptyWhenUserEmailDoesNotExist() {

        Optional<Professional> professional =
                professionalRepository.findByUserEmail("noexiste@gmail.com");

        assertTrue(professional.isEmpty());
    }

    @Test
    void shouldFindProfessionalsBySpecialtyNameIgnoreCase() {

        List<Professional> professionals =
                professionalRepository
                        .findBySpecialtyNameIgnoreCase("cardiologia");

        assertFalse(professionals.isEmpty());
    }

    @Test
    void shouldFindProfessionalsByLocationIgnoreCase() {

        List<Professional> professionals =
                professionalRepository
                        .findByLocationIgnoreCase("lima");

        assertFalse(professionals.isEmpty());
    }

    @Test
    void shouldFindProfessionalsByMaxPrice() {

        List<Professional> professionals =
                professionalRepository
                        .findDistinctByMedicalServicesPriceLessThanEqual(1000.0);

        assertFalse(professionals.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenMaxPriceIsTooLow() {

        List<Professional> professionals =
                professionalRepository
                        .findDistinctByMedicalServicesPriceLessThanEqual(1.0);

        assertTrue(professionals.isEmpty());
    }

    @Test
    void shouldFindProfessionalsBySpecialtyAndLocation() {

        List<Professional> professionals =
                professionalRepository
                        .findBySpecialtyNameIgnoreCaseAndLocationIgnoreCase(
                                "cardiologia",
                                "lima"
                        );

        assertFalse(professionals.isEmpty());
    }

    @Test
    void shouldReturnEmptyForUnmatchedSpecialtyAndLocation() {

        List<Professional> professionals =
                professionalRepository
                        .findBySpecialtyNameIgnoreCaseAndLocationIgnoreCase(
                                "cardiologia",
                                "cusco"
                        );

        assertTrue(professionals.isEmpty());
    }
}
