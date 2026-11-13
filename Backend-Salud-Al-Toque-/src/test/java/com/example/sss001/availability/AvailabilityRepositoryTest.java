package com.example.sss001.availability;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.availability.domain.Availability;
import com.example.sss001.availability.infrastructure.AvailabilityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AvailabilityRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Test
    void shouldFindAvailabilitiesByProfessionalId() {

        List<Availability> availabilities =
                availabilityRepository.findByProfessionalId(1L);

        assertFalse(availabilities.isEmpty());

        assertEquals(
                1L,
                availabilities.get(0)
                        .getProfessional()
                        .getId()
        );
    }

    @Test
    void shouldFindAvailabilitiesByProfessionalAndDay() {

        List<Availability> availabilities =
                availabilityRepository
                        .findByProfessionalIdAndDayOfWeek(
                                1L,
                                "LUNES"
                        );

        assertFalse(availabilities.isEmpty());

        assertEquals(
                "LUNES",
                availabilities.get(0).getDayOfWeek()
        );
    }

    @Test
    void shouldReturnEmptyForUnavailableDay() {

        List<Availability> availabilities =
                availabilityRepository
                        .findByProfessionalIdAndDayOfWeek(
                                1L,
                                "Domingo"
                        );

        assertTrue(availabilities.isEmpty());
    }
}