package com.clinicbooking.paymentservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_payment_order_id", columnList = "payment_order_id"),
        @Index(name = "idx_request_id", columnList = "request_id"),
        @Index(name = "idx_trans_id", columnList = "trans_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id", nullable = false)
    @NotNull(message = "Payment order cannot be null")
    private PaymentOrder paymentOrder;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Partner code cannot be blank")
    private String partnerCode;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Request ID cannot be blank")
    private String requestId;

    @Column(name = "trans_id")
    private Long transId;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Request type cannot be blank")
    private String requestType;

    @Column(nullable = false)
    @NotNull(message = "Amount cannot be null")
    private Long amount;

    @Column(columnDefinition = "TEXT")
    private String orderInfo;

    @Column(columnDefinition = "TEXT")
    private String redirectUrl;

    @Column(columnDefinition = "TEXT")
    private String ipnUrl;

    @Column(columnDefinition = "TEXT")
    private String payUrl;

    @Column(columnDefinition = "TEXT")
    private String deeplink;

    @Column(name = "qr_code_url", columnDefinition = "TEXT")
    private String qrCodeUrl;

    @Column(length = 512)
    private String signature;

    @Column(name = "request_signature", length = 512)
    private String requestSignature;

    @Column(name = "result_code")
    private Integer resultCode;

    @Column(columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public boolean isSuccess() {
        return resultCode != null && resultCode == 0;
    }

    public boolean hasMomoTransId() {
        return transId != null;
    }

    public boolean hasPaymentUrl() {
        return payUrl != null && !payUrl.isEmpty();
    }

    public boolean hasDeeplink() {
        return deeplink != null && !deeplink.isEmpty();
    }

    public boolean hasQrCode() {
        return qrCodeUrl != null && !qrCodeUrl.isEmpty();
    }
}
