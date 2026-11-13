package com.example.sss001.patient;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.patient.domain.Patient;
import com.example.sss001.patient.infrastructure.PatientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PatientRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private PatientRepository patientRepository;

    @Test
    void shouldFindPatientByUserEmail() {

        Optional<Patient> patient =
                patientRepository.findByUserEmail("luis@gmail.com");

        assertTrue(patient.isPresent());

        assertEquals(
                "luis@gmail.com",
                patient.get().getUser().getEmail()
        );
    }

    @Test
    void shouldReturnEmptyWhenUserEmailDoesNotExist() {

        Optional<Patient> patient =
                patientRepository.findByUserEmail("noexiste@gmail.com");

        assertTrue(patient.isEmpty());
    }

    @Test
    void shouldSaveAndRetrievePatient() {

        Patient patient = new Patient();
        patient.setAddress("Miraflores");

        Patient saved =
                patientRepository.save(patient);

        assertNotNull(saved.getId());

        Optional<Patient> found =
                patientRepository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("Miraflores", found.get().getAddress());
    }
}
