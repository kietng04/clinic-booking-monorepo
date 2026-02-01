package com.clinicbooking.consultationservice.entity;

/**
 * Status of a consultation request
 */
public enum ConsultationStatus {
    /**
     * Consultation request created, waiting for doctor acceptance
     */
    PENDING,

    /**
     * Doctor has accepted the consultation request
     */
    ACCEPTED,

    /**
     * Consultation is currently in progress (chatting)
     */
    IN_PROGRESS,

    /**
     * Consultation has been completed successfully
     */
    COMPLETED,

    /**
     * Doctor has rejected the consultation request
     */
    REJECTED,

    /**
     * Patient has cancelled the consultation request
     */
    CANCELLED
}
