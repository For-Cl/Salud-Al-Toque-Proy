package com.example.sss001.favorite;

import com.example.sss001.favorite.domain.Favorite;
import com.example.sss001.favorite.infrastructure.FavoriteRepository;
import com.example.sss001.AbstractContainerBaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class FavoriteRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Test
    void shouldReturnEmptyFavoritesForPatientWithoutFavorites() {

        List<Favorite> favorites =
                favoriteRepository.findByPatientId(1L);

        assertNotNull(favorites);

        assertTrue(favorites.isEmpty());
    }

    @Test
    void shouldReturnFalseWhenFavoriteDoesNotExist() {

        boolean exists =
                favoriteRepository
                        .existsByPatientIdAndProfessionalId(
                                1L,
                                1L
                        );

        assertFalse(exists);
    }
}