package com.example.sss001.notification;

public interface EmailService {

    void sendWelcomeEmail(
            String to,
            String name
    );

    void sendAppointmentConfirmation(
            String to,
            String patientName,
            String date,
            String time,
            String professionalName,
            String medicalServiceName,
            Double price
    );

    void sendAppointmentNotificationToProfessional(
            String to,
            String professionalName,
            String patientName,
            String date,
            String time,
            String medicalServiceName
    );

    void sendReviewNotification(
            String to,
            String professionalName,
            String patientName,
            Integer rating,
            String comment
    );
}
