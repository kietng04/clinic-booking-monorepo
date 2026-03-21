package com.clinicbooking.appointmentservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEvent {
    private String eventType;
    private String eventId;
    private LocalDateTime timestamp;
    private String source;
    private PaymentEventData data;
    private String version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentEventData {
        private String orderId;
        private Long appointmentId;
        private Long patientId;
        private Long doctorId;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private LocalDateTime completedAt;
        private Integer resultCode;
        private String resultMessage;
    }
}
