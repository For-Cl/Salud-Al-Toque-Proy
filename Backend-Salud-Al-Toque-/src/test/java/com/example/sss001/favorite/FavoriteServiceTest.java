package com.example.sss001.favorite;

import com.example.sss001.favorite.domain.Favorite;
import com.example.sss001.favorite.domain.FavoriteService;
import com.example.sss001.favorite.infrastructure.FavoriteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository repository;

    @InjectMocks
    private FavoriteService service;

    @Test
    void shouldReturnFavoritesByPatient() {

        Favorite favorite1 = new Favorite();
        Favorite favorite2 = new Favorite();

        when(repository.findByPatientId(1L))
                .thenReturn(List.of(favorite1, favorite2));

        List<Favorite> result =
                service.findByPatientId(1L);

        assertEquals(2, result.size());

        verify(repository)
                .findByPatientId(1L);
    }

    @Test
    void shouldReturnFavoriteById() {

        Favorite favorite = new Favorite();

        when(repository.findById(1L))
                .thenReturn(java.util.Optional.of(favorite));

        Favorite result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnTrueWhenFavoriteExists() {

        when(repository.existsByPatientIdAndProfessionalId(1L, 2L))
                .thenReturn(true);

        boolean result =
                service.existsByPatientAndProfessional(1L, 2L);

        assertTrue(result);

        verify(repository)
                .existsByPatientIdAndProfessionalId(1L, 2L);
    }

    @Test
    void shouldReturnFalseWhenFavoriteDoesNotExist() {

        when(repository.existsByPatientIdAndProfessionalId(1L, 2L))
                .thenReturn(false);

        boolean result =
                service.existsByPatientAndProfessional(1L, 2L);

        assertFalse(result);

        verify(repository)
                .existsByPatientIdAndProfessionalId(1L, 2L);
    }

    @Test
    void shouldSaveFavorite() {

        Favorite favorite = new Favorite();

        when(repository.save(favorite))
                .thenReturn(favorite);

        Favorite result =
                service.save(favorite);

        assertNotNull(result);

        verify(repository)
                .save(favorite);
    }

    @Test
    void shouldDeleteFavorite() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}