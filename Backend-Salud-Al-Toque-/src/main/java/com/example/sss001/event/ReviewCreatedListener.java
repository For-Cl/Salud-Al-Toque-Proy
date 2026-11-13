package com.example.sss001.event;

import com.example.sss001.notification.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ReviewCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(ReviewCreatedListener.class);
    private final EmailService emailService;

    public ReviewCreatedListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("notificationExecutor")
    @EventListener
    public void handle(ReviewCreatedEvent event) {
        log.info("ASYNC EVENT START type=ReviewCreatedEvent reviewId={} thread={}",
                event.getReviewId(), Thread.currentThread().getName());
        try {
            emailService.sendReviewNotification(
                    event.getProfessionalEmail(), event.getProfessionalName(),
                    event.getPatientName(), event.getRating(), event.getComment());
            log.info("ASYNC EVENT END type=ReviewCreatedEvent reviewId={} thread={}",
                    event.getReviewId(), Thread.currentThread().getName());
        } catch (RuntimeException ex) {
            log.error("ASYNC EVENT ERROR type=ReviewCreatedEvent reviewId={} thread={}",
                    event.getReviewId(), Thread.currentThread().getName(), ex);
            throw ex;
        }
    }
}
