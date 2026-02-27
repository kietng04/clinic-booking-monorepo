package com.clinicbooking.paymentservice.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    
    @JsonProperty("eventType")
    private String eventType;

    
    @JsonProperty("eventId")
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    
    @JsonProperty("timestamp")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    
    @JsonProperty("source")
    @Builder.Default
    private String source = "payment-service";

    
    @JsonProperty("data")
    private PaymentEventData data;

    
    @JsonProperty("version")
    @Builder.Default
    private String version = "1.0";

    
    @JsonProperty("metadata")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentEventData implements Serializable {

        
        @JsonProperty("orderId")
        private String orderId;

        
        @JsonProperty("appointmentId")
        private Long appointmentId;

        
        @JsonProperty("patientId")
        private Long patientId;

        
        @JsonProperty("doctorId")
        private Long doctorId;

        
        @JsonProperty("amount")
        private BigDecimal amount;

        
        @JsonProperty("currency")
        @Builder.Default
        private String currency = "VND";

        
        @JsonProperty("status")
        private String status;

        
        @JsonProperty("paymentMethod")
        private String paymentMethod;

        
        @JsonProperty("transactionId")
        private String transactionId;

        
        @JsonProperty("description")
        private String description;

        
        @JsonProperty("createdAt")
        private LocalDateTime createdAt;

        
        @JsonProperty("completedAt")
        private LocalDateTime completedAt;

        
        @JsonProperty("resultCode")
        private Integer resultCode;

        
        @JsonProperty("resultMessage")
        private String resultMessage;

        
        @JsonProperty("refundAmount")
        private BigDecimal refundAmount;

        
        @JsonProperty("refundReason")
        private String refundReason;

        
        @JsonProperty("errorMessage")
        private String errorMessage;

        
        @JsonProperty("errorCode")
        private String errorCode;
    }

    
    public static PaymentEvent paymentCreated(String orderId, Long appointmentId, Long patientId,
                                              Long doctorId, BigDecimal amount, String paymentMethod,
                                              String description) {
        return PaymentEvent.builder()
                .eventType("payment.created")
                .data(PaymentEventData.builder()
                        .orderId(orderId)
                        .appointmentId(appointmentId)
                        .patientId(patientId)
                        .doctorId(doctorId)
                        .amount(amount)
                        .currency("VND")
                        .status("PENDING")
                        .paymentMethod(paymentMethod)
                        .description(description)
                        .createdAt(LocalDateTime.now())
                        .build())
                .build();
    }

    
    public static PaymentEvent paymentCompleted(String orderId, Long appointmentId, Long patientId,
                                               Long doctorId, BigDecimal amount, String transactionId) {
        return PaymentEvent.builder()
                .eventType("payment.completed")
                .data(PaymentEventData.builder()
                        .orderId(orderId)
                        .appointmentId(appointmentId)
                        .patientId(patientId)
                        .doctorId(doctorId)
                        .amount(amount)
                        .currency("VND")
                        .status("COMPLETED")
                        .transactionId(transactionId)
                        .completedAt(LocalDateTime.now())
                        .resultCode(0)
                        .resultMessage("Thanh toán thành công")
                        .build())
                .build();
    }

    
    public static PaymentEvent paymentFailed(String orderId, Long appointmentId, Long patientId,
                                            Long doctorId, String errorMessage, String errorCode) {
        return PaymentEvent.builder()
                .eventType("payment.failed")
                .data(PaymentEventData.builder()
                        .orderId(orderId)
                        .appointmentId(appointmentId)
                        .patientId(patientId)
                        .doctorId(doctorId)
                        .status("FAILED")
                        .errorMessage(errorMessage)
                        .errorCode(errorCode)
                        .build())
                .build();
    }

    
    public static PaymentEvent paymentRefunded(String orderId, Long appointmentId, Long patientId,
                                              Long doctorId, BigDecimal refundAmount, String refundReason,
                                              boolean isPartial) {
        return PaymentEvent.builder()
                .eventType(isPartial ? "payment.partially_refunded" : "payment.refunded")
                .data(PaymentEventData.builder()
                        .orderId(orderId)
                        .appointmentId(appointmentId)
                        .patientId(patientId)
                        .doctorId(doctorId)
                        .status(isPartial ? "PARTIALLY_REFUNDED" : "REFUNDED")
                        .refundAmount(refundAmount)
                        .refundReason(refundReason)
                        .completedAt(LocalDateTime.now())
                        .build())
                .build();
    }
}
