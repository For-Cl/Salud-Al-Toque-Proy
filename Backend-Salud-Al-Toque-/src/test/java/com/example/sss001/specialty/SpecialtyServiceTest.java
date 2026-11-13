package com.example.sss001.specialty;

import com.example.sss001.specialty.domain.Specialty;
import com.example.sss001.specialty.domain.SpecialtyService;
import com.example.sss001.specialty.infrastructure.SpecialtyRepository;
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
class SpecialtyServiceTest {

    @Mock
    private SpecialtyRepository repository;

    @InjectMocks
    private SpecialtyService service;

    @Test
    void shouldReturnAllSpecialties() {

        Specialty specialty1 = new Specialty();
        Specialty specialty2 = new Specialty();

        when(repository.findAll())
                .thenReturn(List.of(specialty1, specialty2));

        List<Specialty> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnSpecialtyById() {

        Specialty specialty = new Specialty();

        when(repository.findById(1L))
                .thenReturn(Optional.of(specialty));

        Specialty result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenSpecialtyByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Specialty result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldSaveSpecialty() {

        Specialty specialty = new Specialty();
        specialty.setName("Neurologia");

        when(repository.save(specialty))
                .thenReturn(specialty);

        Specialty result =
                service.save(specialty);

        assertNotNull(result);
        assertEquals("Neurologia", result.getName());

        verify(repository)
                .save(specialty);
    }

    @Test
    void shouldDeleteSpecialty() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
