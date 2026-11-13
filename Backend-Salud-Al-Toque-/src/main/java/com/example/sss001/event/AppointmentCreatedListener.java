package com.example.sss001.event;

import com.example.sss001.notification.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AppointmentCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(AppointmentCreatedListener.class);
    private final EmailService emailService;

    public AppointmentCreatedListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("notificationExecutor")
    @EventListener
    public void handle(AppointmentCreatedEvent event) {
        log.info("ASYNC EVENT START type=AppointmentCreatedEvent appointmentId={} thread={}",
                event.getAppointmentId(), Thread.currentThread().getName());
        try {
            emailService.sendAppointmentConfirmation(
                    event.getPatientEmail(), event.getPatientName(), event.getDate(),
                    event.getTime(), event.getProfessionalName(), event.getMedicalServiceName(), event.getPrice());

            emailService.sendAppointmentNotificationToProfessional(
                    event.getProfessionalEmail(), event.getProfessionalName(), event.getPatientName(),
                    event.getDate(), event.getTime(), event.getMedicalServiceName());

            log.info("ASYNC EVENT END type=AppointmentCreatedEvent appointmentId={} thread={}",
                    event.getAppointmentId(), Thread.currentThread().getName());
        } catch (RuntimeException ex) {
            log.error("ASYNC EVENT ERROR type=AppointmentCreatedEvent appointmentId={} thread={}",
                    event.getAppointmentId(), Thread.currentThread().getName(), ex);
            throw ex;
        }
    }
}
