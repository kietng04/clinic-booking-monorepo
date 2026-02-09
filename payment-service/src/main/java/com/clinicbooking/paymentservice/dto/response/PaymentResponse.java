package com.clinicbooking.paymentservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    
    @JsonProperty("patientId")
    private Long patientId;

    
    private String orderId;

    private String invoiceNumber;

    private Long appointmentId;

    
    private String payUrl;

    
    private String deeplink;

    
    private String qrCodeUrl;

    
    private BigDecimal amount;

    private BigDecimal finalAmount;

    private String description;


    private String status;

    @Builder.Default
    private String currency = "VND";

    private LocalDateTime expiresAt;

    private String transactionId;

    private String errorMessage;

    // Payment method (CASH, MOMO_WALLET, etc.)
    private String paymentMethod;

    private LocalDateTime createdAt;

    // Counter payment confirmation metadata
    private Long confirmedByUserId;

    private LocalDateTime confirmedAt;

    private String confirmationNote;
}
