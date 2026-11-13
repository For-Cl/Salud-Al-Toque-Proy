package com.example.sss001.review;

import com.example.sss001.review.domain.Review;
import com.example.sss001.review.domain.ReviewService;
import com.example.sss001.review.infrastructure.ReviewRepository;
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
class ReviewServiceTest {

    @Mock
    private ReviewRepository repository;

    @InjectMocks
    private ReviewService service;

    @Test
    void shouldReturnAllReviews() {

        Review review1 = new Review();
        Review review2 = new Review();

        when(repository.findAll())
                .thenReturn(List.of(review1, review2));

        List<Review> result =
                service.findAll();

        assertEquals(2, result.size());

        verify(repository)
                .findAll();
    }

    @Test
    void shouldReturnReviewById() {

        Review review = new Review();

        when(repository.findById(1L))
                .thenReturn(Optional.of(review));

        Review result =
                service.findById(1L);

        assertNotNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnNullWhenReviewByIdNotFound() {

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        Review result =
                service.findById(1L);

        assertNull(result);

        verify(repository)
                .findById(1L);
    }

    @Test
    void shouldReturnReviewByAppointmentId() {

        Review review = new Review();

        when(repository.findByAppointmentId(1L))
                .thenReturn(Optional.of(review));

        Review result =
                service.findByAppointmentId(1L);

        assertNotNull(result);

        verify(repository)
                .findByAppointmentId(1L);
    }

    @Test
    void shouldReturnNullWhenReviewByAppointmentIdNotFound() {

        when(repository.findByAppointmentId(1L))
                .thenReturn(Optional.empty());

        Review result =
                service.findByAppointmentId(1L);

        assertNull(result);

        verify(repository)
                .findByAppointmentId(1L);
    }

    @Test
    void shouldReturnReviewsByProfessionalId() {

        Review review1 = new Review();
        Review review2 = new Review();

        when(repository.findByProfessionalId(1L))
                .thenReturn(List.of(review1, review2));

        List<Review> result =
                service.findByProfessionalId(1L);

        assertEquals(2, result.size());

        verify(repository)
                .findByProfessionalId(1L);
    }

    @Test
    void shouldReturnTrueWhenAppointmentAlreadyHasReview() {

        when(repository.existsByAppointmentId(1L))
                .thenReturn(true);

        boolean result =
                service.existsByAppointmentId(1L);

        assertTrue(result);

        verify(repository)
                .existsByAppointmentId(1L);
    }

    @Test
    void shouldReturnFalseWhenAppointmentHasNoReview() {

        when(repository.existsByAppointmentId(1L))
                .thenReturn(false);

        boolean result =
                service.existsByAppointmentId(1L);

        assertFalse(result);

        verify(repository)
                .existsByAppointmentId(1L);
    }

    @Test
    void shouldSaveReview() {

        Review review = new Review();
        review.setRating(5);

        when(repository.save(review))
                .thenReturn(review);

        Review result =
                service.save(review);

        assertNotNull(result);
        assertEquals(5, result.getRating());

        verify(repository)
                .save(review);
    }

    @Test
    void shouldDeleteReview() {

        service.delete(1L);

        verify(repository)
                .deleteById(1L);
    }
}
