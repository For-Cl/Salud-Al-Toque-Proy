package com.example.sss001.event;

import com.example.sss001.notification.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserRegisteredListener {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredListener.class);
    private final EmailService emailService;

    public UserRegisteredListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("notificationExecutor")
    @EventListener
    public void handle(UserRegisteredEvent event) {
        log.info("ASYNC EVENT START type=UserRegisteredEvent userId={} thread={}",
                event.getUserId(), Thread.currentThread().getName());
        try {
            emailService.sendWelcomeEmail(event.getEmail(), event.getName());
            log.info("ASYNC EVENT END type=UserRegisteredEvent userId={} thread={}",
                    event.getUserId(), Thread.currentThread().getName());
        } catch (RuntimeException ex) {
            log.error("ASYNC EVENT ERROR type=UserRegisteredEvent userId={} thread={}",
                    event.getUserId(), Thread.currentThread().getName(), ex);
            throw ex;
        }
    }
}
