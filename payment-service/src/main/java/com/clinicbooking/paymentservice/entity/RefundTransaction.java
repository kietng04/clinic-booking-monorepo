package com.clinicbooking.paymentservice.entity;

import com.clinicbooking.paymentservice.enums.RefundStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_transactions", indexes = {
        @Index(name = "idx_payment_order_id", columnList = "payment_order_id"),
        @Index(name = "idx_payment_transaction_id", columnList = "payment_transaction_id"),
        @Index(name = "idx_refund_id", columnList = "refund_id"),
        @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id", nullable = false)
    @NotNull(message = "Payment order cannot be null")
    private PaymentOrder paymentOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_transaction_id", nullable = false)
    @NotNull(message = "Payment transaction cannot be null")
    private PaymentTransaction paymentTransaction;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Refund ID cannot be blank")
    private String refundId;

    @Column(nullable = false, name = "trans_id")
    @NotNull(message = "Transaction ID cannot be null")
    private Long transId;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "result_code")
    private Integer resultCode;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @NotNull(message = "Status cannot be null")
    @Builder.Default
    private RefundStatus status = RefundStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public boolean isCompleted() {
        return status == RefundStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == RefundStatus.FAILED;
    }

    public boolean isPending() {
        return status == RefundStatus.PENDING;
    }

    public boolean isSuccess() {
        return resultCode != null && resultCode == 0;
    }
}
