package com.example.sss001.notification;

import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final boolean emailEnabled;
    private final String from;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            TemplateEngine templateEngine,
            @Value("${notification.email.enabled:false}") boolean emailEnabled,
            @Value("${spring.mail.username:no-reply@saludaltoque.local}") String from) {

        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.emailEnabled = emailEnabled;
        this.from = from;
    }

    @Override
    public void sendWelcomeEmail(
            String to,
            String name) {

        send(
                to,
                "Bienvenido a Salud al Toque",
                "welcome",
                context("name", name)
        );
    }

    @Override
    public void sendAppointmentConfirmation(
            String to,
            String patientName,
            String date,
            String time,
            String professionalName,
            String medicalServiceName,
            Double price) {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("date", date);
        context.setVariable("time", time);
        context.setVariable("professionalName", professionalName);
        context.setVariable("medicalServiceName", medicalServiceName);
        context.setVariable("price", price);

        send(
                to,
                "Confirmación de cita - Salud al Toque",
                "appointment-confirmation",
                context
        );
    }

    @Override
    public void sendAppointmentNotificationToProfessional(
            String to,
            String professionalName,
            String patientName,
            String date,
            String time,
            String medicalServiceName) {

        Context context = new Context();
        context.setVariable("professionalName", professionalName);
        context.setVariable("patientName", patientName);
        context.setVariable("date", date);
        context.setVariable("time", time);
        context.setVariable("medicalServiceName", medicalServiceName);

        send(
                to,
                "Nueva cita registrada - Salud al Toque",
                "appointment-professional",
                context
        );
    }

    @Override
    public void sendReviewNotification(
            String to,
            String professionalName,
            String patientName,
            Integer rating,
            String comment) {

        Context context = new Context();
        context.setVariable("professionalName", professionalName);
        context.setVariable("patientName", patientName);
        context.setVariable("rating", rating);
        context.setVariable("comment", comment);

        send(
                to,
                "Nueva reseña recibida - Salud al Toque",
                "review-notification",
                context
        );
    }

    private Context context(
            String key,
            Object value) {

        Context context = new Context();
        context.setVariable(key, value);
        return context;
    }

    private void send(
            String to,
            String subject,
            String template,
            Context context) {

        if (!emailEnabled) {
            log.info("EMAIL SKIPPED reason=disabled to={} subject={} thread={}",
                    to, subject, Thread.currentThread().getName());
            return;
        }

        if (to == null || to.isBlank()) {
            log.warn("EMAIL SKIPPED reason=empty-recipient subject={} thread={}",
                    subject, Thread.currentThread().getName());
            return;
        }

        try {
            String html =
                    templateEngine.process(
                            template,
                            context
                    );

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("EMAIL SENT to={} subject={} thread={}",
                    to, subject, Thread.currentThread().getName());

        } catch (Exception e) {
            System.err.println(
                    "No se pudo enviar el correo a "
                            + to
                            + ": "
                            + e.getMessage()
            );
        }
    }
}
