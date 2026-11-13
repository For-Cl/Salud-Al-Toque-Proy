package com.example.sss001.professional;

import com.example.sss001.professional.domain.Professional;
import com.example.sss001.professional.domain.ProfessionalService;
import com.example.sss001.professional.infrastructure.ProfessionalRepository;
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
class ProfessionalServiceTest {

    @Mock
    private ProfessionalRepository repository;

    @InjectMocks
    private ProfessionalService service;

    @Test
    void shouldReturnAllProfessionals() {

        Professional professional1 = new Professional();
        Professional professional2 = new Professional();

        when(repository.findAll())
                .thenReturn(List.of(professional1, professional2));

        List<Professional> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnProfessionalsBySpecialty() {

        Professional professional = new Professional();

        when(repository.findBySpecialtyNameIgnoreCase("Cardiologia"))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.findBySpecialty("Cardiologia");

        assertEquals(1, result.size());

        verify(repository)
                .findBySpecialtyNameIgnoreCase("Cardiologia");
    }

    @Test
    void shouldReturnProfessionalById() {

        Professional professional = new Professional();

        when(repository.findById(1L))
                .thenReturn(Optional.of(professional));

        Professional result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenProfessionalByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Professional result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnProfessionalByUserEmail() {

        Professional professional = new Professional();

        when(repository.findByUserEmail("carlos@gmail.com"))
                .thenReturn(Optional.of(professional));

        Professional result =
                service.findByUserEmail("carlos@gmail.com");

        assertNotNull(result);

        verify(repository)
                .findByUserEmail("carlos@gmail.com");
    }

    @Test
    void shouldReturnNullWhenProfessionalByUserEmailNotFound() {

        when(repository.findByUserEmail("noexiste@gmail.com"))
                .thenReturn(Optional.empty());

        Professional result =
                service.findByUserEmail("noexiste@gmail.com");

        assertNull(result);

        verify(repository)
                .findByUserEmail("noexiste@gmail.com");
    }

    @Test
    void shouldSaveProfessional() {

        Professional professional = new Professional();
        professional.setLocation("Lima");

        when(repository.save(professional))
                .thenReturn(professional);

        Professional result =
                service.save(professional);

        assertNotNull(result);
        assertEquals("Lima", result.getLocation());

        verify(repository)
                .save(professional);
    }

    @Test
    void shouldDeleteProfessional() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }

    // =========================================================
    // search() - combinaciones de filtros
    // =========================================================

    @Test
    void shouldSearchBySpecialtyLocationAndMaxPrice() {

        Professional professional = new Professional();

        when(repository
                .findDistinctBySpecialtyNameIgnoreCaseAndLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Cardiologia", "Lima", 100.0))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search("Cardiologia", "Lima", 100.0);

        assertEquals(1, result.size());

        verify(repository)
                .findDistinctBySpecialtyNameIgnoreCaseAndLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Cardiologia", "Lima", 100.0);
    }

    @Test
    void shouldSearchBySpecialtyAndLocation() {

        Professional professional = new Professional();

        when(repository
                .findBySpecialtyNameIgnoreCaseAndLocationIgnoreCase(
                        "Cardiologia", "Lima"))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search("Cardiologia", "Lima", null);

        assertEquals(1, result.size());

        verify(repository)
                .findBySpecialtyNameIgnoreCaseAndLocationIgnoreCase(
                        "Cardiologia", "Lima");
    }

    @Test
    void shouldSearchBySpecialtyAndMaxPrice() {

        Professional professional = new Professional();

        when(repository
                .findDistinctBySpecialtyNameIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Cardiologia", 100.0))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search("Cardiologia", null, 100.0);

        assertEquals(1, result.size());

        verify(repository)
                .findDistinctBySpecialtyNameIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Cardiologia", 100.0);
    }

    @Test
    void shouldSearchByLocationAndMaxPrice() {

        Professional professional = new Professional();

        when(repository
                .findDistinctByLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Lima", 100.0))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search(null, "Lima", 100.0);

        assertEquals(1, result.size());

        verify(repository)
                .findDistinctByLocationIgnoreCaseAndMedicalServicesPriceLessThanEqual(
                        "Lima", 100.0);
    }

    @Test
    void shouldSearchOnlyBySpecialty() {

        Professional professional = new Professional();

        when(repository.findBySpecialtyNameIgnoreCase("Cardiologia"))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search("Cardiologia", null, null);

        assertEquals(1, result.size());

        verify(repository)
                .findBySpecialtyNameIgnoreCase("Cardiologia");
    }

    @Test
    void shouldSearchOnlyByLocation() {

        Professional professional = new Professional();

        when(repository.findByLocationIgnoreCase("Lima"))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search(null, "Lima", null);

        assertEquals(1, result.size());

        verify(repository)
                .findByLocationIgnoreCase("Lima");
    }

    @Test
    void shouldSearchOnlyByMaxPrice() {

        Professional professional = new Professional();

        when(repository.findDistinctByMedicalServicesPriceLessThanEqual(100.0))
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search(null, null, 100.0);

        assertEquals(1, result.size());

        verify(repository)
                .findDistinctByMedicalServicesPriceLessThanEqual(100.0);
    }

    @Test
    void shouldSearchWithoutFilters() {

        Professional professional = new Professional();

        when(repository.findAll())
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search(null, null, null);

        assertEquals(1, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldTreatBlankSpecialtyAndLocationAsAbsent() {

        Professional professional = new Professional();

        when(repository.findAll())
                .thenReturn(List.of(professional));

        List<Professional> result =
                service.search("   ", "  ", null);

        assertEquals(1, result.size());

        verify(repository)
                .findAll();
    }
}
