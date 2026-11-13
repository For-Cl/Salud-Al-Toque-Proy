package com.example.sss001.event;

public class AppointmentCreatedEvent {

    private final Long appointmentId;
    private final String date;
    private final String time;
    private final String patientName;
    private final String patientEmail;
    private final String professionalName;
    private final String professionalEmail;
    private final String medicalServiceName;
    private final Double price;

    public AppointmentCreatedEvent(
            Long appointmentId,
            String date,
            String time,
            String patientName,
            String patientEmail,
            String professionalName,
            String professionalEmail,
            String medicalServiceName,
            Double price) {

        this.appointmentId = appointmentId;
        this.date = date;
        this.time = time;
        this.patientName = patientName;
        this.patientEmail = patientEmail;
        this.professionalName = professionalName;
        this.professionalEmail = professionalEmail;
        this.medicalServiceName = medicalServiceName;
        this.price = price;
    }

    public Long getAppointmentId() { return appointmentId; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getPatientName() { return patientName; }
    public String getPatientEmail() { return patientEmail; }
    public String getProfessionalName() { return professionalName; }
    public String getProfessionalEmail() { return professionalEmail; }
    public String getMedicalServiceName() { return medicalServiceName; }
    public Double getPrice() { return price; }
}
