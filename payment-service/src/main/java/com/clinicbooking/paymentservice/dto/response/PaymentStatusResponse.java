package com.clinicbooking.paymentservice.dto.response;

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
public class PaymentStatusResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderDetails implements Serializable {
        
        private String orderId;

        
        private Long appointmentId;

        
        private Long patientId;

        
        private Long doctorId;

        
        private BigDecimal amount;

        
        private String currency;

        
        private String description;

        
        private String paymentMethod;

        
        private String status;

        
        private LocalDateTime createdAt;

        
        private LocalDateTime updatedAt;

        
        private LocalDateTime completedAt;

        
        private LocalDateTime expiredAt;
    }

    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionDetails implements Serializable {
        
        private String requestId;

        
        private String transactionId;

        
        private Integer resultCode;

        
        private String message;

        
        private String payUrl;

        
        private String deeplink;

        
        private String qrCodeUrl;

        
        private LocalDateTime createdAt;

        
        private LocalDateTime updatedAt;
    }

    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RefundDetails implements Serializable {
        
        private BigDecimal totalRefundAmount;

        
        private Integer refundCount;

        
        private String latestRefundStatus;

        
        private LocalDateTime latestRefundDate;
    }

    
    private OrderDetails order;

    
    private TransactionDetails transaction;

    
    private RefundDetails refund;

    
    private String status;

    
    private Boolean isTerminal;

    
    private Boolean isSuccessful;
}
