package com.example.sss001.specialty;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.specialty.domain.Specialty;
import com.example.sss001.specialty.infrastructure.SpecialtyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class SpecialtyRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Test
    void shouldFindSpecialtyByName() {

        Optional<Specialty> specialty =
                specialtyRepository.findByName("Cardiologia");

        assertTrue(specialty.isPresent());

        assertEquals(
                "Cardiologia",
                specialty.get().getName()
        );
    }

    @Test
    void shouldReturnEmptyWhenSpecialtyNameDoesNotExist() {

        Optional<Specialty> specialty =
                specialtyRepository.findByName("Inexistente");

        assertTrue(specialty.isEmpty());
    }

    @Test
    void shouldSaveAndRetrieveSpecialty() {

        Specialty specialty = new Specialty();
        specialty.setName("Traumatologia");

        Specialty saved =
                specialtyRepository.save(specialty);

        assertNotNull(saved.getId());

        Optional<Specialty> found =
                specialtyRepository.findByName("Traumatologia");

        assertTrue(found.isPresent());
    }
}
