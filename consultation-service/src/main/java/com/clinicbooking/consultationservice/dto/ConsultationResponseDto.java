package com.clinicbooking.consultationservice.dto;

import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for consultation response with full details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private String topic;
    private String description;
    private ConsultationStatus status;
    private BigDecimal fee;
    private Boolean isPaid;
    private String paymentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;
    private String doctorNotes;
    private String diagnosis;
    private String prescription;
    private BigDecimal rating;
    private String review;

    /**
     * Number of unread messages for the current user
     */
    private Long unreadCount;

    /**
     * Latest message in the consultation
     */
    private MessageDto latestMessage;
}
