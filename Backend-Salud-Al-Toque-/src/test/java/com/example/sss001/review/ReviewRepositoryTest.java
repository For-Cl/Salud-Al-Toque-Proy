package com.example.sss001.review;

import com.example.sss001.AbstractContainerBaseTest;
import com.example.sss001.review.domain.Review;
import com.example.sss001.review.infrastructure.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ReviewRepositoryTest extends AbstractContainerBaseTest {

    @Autowired
    private ReviewRepository reviewRepository;

    @Test
    void shouldReturnEmptyReviewsWhenProfessionalHasNoReviews() {

        List<Review> reviews =
                reviewRepository.findByProfessionalId(1L);

        assertNotNull(reviews);

        assertTrue(reviews.isEmpty());
    }

    @Test
    void shouldReturnFalseWhenAppointmentHasNoReview() {

        boolean exists =
                reviewRepository.existsByAppointmentId(1L);

        assertFalse(exists);
    }

    @Test
    void shouldReturnEmptyWhenAppointmentHasNoReview() {

        Optional<Review> review =
                reviewRepository.findByAppointmentId(1L);
        assertNotNull(review);
        assertTrue(review.isEmpty());
    }
}