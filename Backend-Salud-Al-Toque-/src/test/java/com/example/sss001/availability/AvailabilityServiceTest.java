package com.example.sss001.availability;

import com.example.sss001.availability.domain.Availability;
import com.example.sss001.availability.domain.AvailabilityService;
import com.example.sss001.availability.infrastructure.AvailabilityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private AvailabilityRepository repository;

    @InjectMocks
    private AvailabilityService service;

    @Test
    void shouldReturnAllAvailabilities() {

        Availability availability1 = new Availability();
        Availability availability2 = new Availability();

        when(repository.findAll())
                .thenReturn(List.of(availability1, availability2));

        List<Availability> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnAvailabilityById() {

        Availability availability = new Availability();

        when(repository.findById(1L))
                .thenReturn(Optional.of(availability));

        Availability result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenAvailabilityByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Availability result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnAvailabilitiesByProfessionalId() {

        Availability availability = new Availability();

        when(repository.findByProfessionalId(1L))
                .thenReturn(List.of(availability));

        List<Availability> result =
                service.findByProfessionalId(1L);

        assertEquals(1, result.size());

        verify(repository)
                .findByProfessionalId(1L);
    }

    @Test
    void shouldReturnAvailabilitiesByProfessionalAndDay() {

        Availability availability = new Availability();

        when(repository.findByProfessionalIdAndDayOfWeek(1L, "LUNES"))
                .thenReturn(List.of(availability));

        List<Availability> result =
                service.findByProfessionalAndDay(1L, "LUNES");

        assertEquals(1, result.size());

        verify(repository)
                .findByProfessionalIdAndDayOfWeek(1L, "LUNES");
    }

    @Test
    void shouldSaveAvailability() {

        Availability availability = new Availability();
        availability.setDayOfWeek("MARTES");

        when(repository.save(availability))
                .thenReturn(availability);

        Availability result =
                service.save(availability);

        assertNotNull(result);
        assertEquals("MARTES", result.getDayOfWeek());

        verify(repository)
                .save(availability);
    }

    @Test
    void shouldDeleteAvailability() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
