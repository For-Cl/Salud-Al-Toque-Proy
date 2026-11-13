package com.example.sss001.event;

public class ReviewCreatedEvent {

    private final Long reviewId;
    private final String professionalName;
    private final String professionalEmail;
    private final String patientName;
    private final Integer rating;
    private final String comment;

    public ReviewCreatedEvent(
            Long reviewId,
            String professionalName,
            String professionalEmail,
            String patientName,
            Integer rating,
            String comment) {

        this.reviewId = reviewId;
        this.professionalName = professionalName;
        this.professionalEmail = professionalEmail;
        this.patientName = patientName;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getReviewId() { return reviewId; }
    public String getProfessionalName() { return professionalName; }
    public String getProfessionalEmail() { return professionalEmail; }
    public String getPatientName() { return patientName; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
}
