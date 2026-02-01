package com.clinicbooking.consultationservice.entity;

/**
 * Type of message content
 */
public enum MessageType {
    /**
     * Regular text message
     */
    TEXT,

    /**
     * Image attachment
     */
    IMAGE,

    /**
     * File attachment (PDF, documents, etc.)
     */
    FILE,

    /**
     * System notification (e.g., "Doctor joined the chat")
     */
    SYSTEM
}
