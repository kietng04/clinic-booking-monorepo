package com.clinicbooking.consultationservice.dto;

import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for consultation summary (used in lists)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSummaryDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private String topic;
    private ConsultationStatus status;
    private BigDecimal fee;
    private Boolean isPaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Number of unread messages
     */
    private Long unreadCount;

    /**
     * Preview of latest message
     */
    private String latestMessagePreview;

    /**
     * Timestamp of latest message
     */
    private LocalDateTime latestMessageTime;
}
