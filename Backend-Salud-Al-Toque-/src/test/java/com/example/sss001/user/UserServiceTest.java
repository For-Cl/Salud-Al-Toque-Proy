package com.example.sss001.user;

import com.example.sss001.user.domain.User;
import com.example.sss001.user.domain.UserService;
import com.example.sss001.user.infrastructure.UserRepository;
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
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;

    @Test
    void shouldReturnAllUsers() {

        User user1 = new User();
        User user2 = new User();

        when(repository.findAll())
                .thenReturn(List.of(user1, user2));

        List<User> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnUserById() {

        User user = new User();

        when(repository.findById(1L))
                .thenReturn(Optional.of(user));

        User result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenUserByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        User result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldSaveUser() {

        User user = new User();
        user.setEmail("nuevo@gmail.com");

        when(repository.save(user))
                .thenReturn(user);

        User result =
                service.save(user);

        assertNotNull(result);
        assertEquals("nuevo@gmail.com", result.getEmail());

        verify(repository)
                .save(user);
    }

    @Test
    void shouldDeleteUser() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
