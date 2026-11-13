package com.example.sss001.user;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {

        Optional<User> user =
                userRepository.findByEmail("admin@gmail.com");

        assertTrue(user.isPresent());

        assertEquals(
                "ADMIN",
                user.get().getRole()
        );
    }

    @Test
    void shouldReturnEmptyWhenEmailDoesNotExist() {

        Optional<User> user =
                userRepository.findByEmail("noexiste@gmail.com");

        assertTrue(user.isEmpty());
    }

    @Test
    void shouldSaveAndRetrieveUser() {

        User user = new User();
        user.setName("Test User");
        user.setEmail("test.user@gmail.com");
        user.setPassword("secret");
        user.setPhone("999888777");
        user.setRole("PATIENT");

        User saved =
                userRepository.save(user);

        assertNotNull(saved.getId());

        Optional<User> found =
                userRepository.findByEmail("test.user@gmail.com");

        assertTrue(found.isPresent());
        assertEquals("Test User", found.get().getName());
    }
}
