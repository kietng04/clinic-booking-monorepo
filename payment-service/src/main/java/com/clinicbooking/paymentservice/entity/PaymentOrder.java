package com.clinicbooking.paymentservice.entity;

import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_orders", indexes = {
        @Index(name = "idx_appointment_id", columnList = "appointment_id"),
        @Index(name = "idx_patient_id", columnList = "patient_id"),
        @Index(name = "idx_order_id", columnList = "order_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Order ID cannot be blank")
    private String orderId;

    @Column(nullable = false, name = "appointment_id")
    @NotNull(message = "Appointment ID cannot be null")
    private Long appointmentId;

    @Column(nullable = false, name = "patient_id")
    @NotNull(message = "Patient ID cannot be null")
    private Long patientId;

    @Column(nullable = false, name = "doctor_id")
    @NotNull(message = "Doctor ID cannot be null")
    private Long doctorId;

    @Column(nullable = false, name = "patient_name")
    @NotBlank(message = "Patient name cannot be blank")
    private String patientName;

    @Column(nullable = false, name = "patient_email")
    @NotBlank(message = "Patient email cannot be blank")
    private String patientEmail;

    @Column(nullable = false, name = "patient_phone", length = 20)
    @NotBlank(message = "Patient phone cannot be blank")
    private String patientPhone;

    @Column(nullable = false, name = "doctor_name")
    @NotBlank(message = "Doctor name cannot be blank")
    private String doctorName;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @NotBlank(message = "Currency cannot be blank")
    @Builder.Default
    private String currency = "VND";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @NotNull(message = "Status cannot be null")
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @OneToMany(mappedBy = "paymentOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentTransaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "paymentOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RefundTransaction> refunds = new ArrayList<>();

    public boolean isCompleted() {
        return status == PaymentStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == PaymentStatus.FAILED;
    }

    public boolean isPending() {
        return status == PaymentStatus.PENDING;
    }

    public boolean isExpired() {
        return status == PaymentStatus.EXPIRED;
    }

    public boolean isRefunded() {
        return status == PaymentStatus.REFUNDED || status == PaymentStatus.PARTIALLY_REFUNDED;
    }
}
