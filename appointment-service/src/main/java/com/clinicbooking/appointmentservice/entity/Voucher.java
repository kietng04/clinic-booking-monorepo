package com.clinicbooking.appointmentservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private BigDecimal discountPercentage; // 0-100

    @Column(nullable = false)
    private BigDecimal maxDiscount; // Max discount amount in VND

    @Column(nullable = false)
    private BigDecimal minPurchaseAmount; // Minimum order amount

    @Column(nullable = false)
    private LocalDateTime validFrom;

    @Column(nullable = false)
    private LocalDateTime validTo;

    @Column(nullable = false)
    private Integer usageLimit; // -1 for unlimited

    @Column(nullable = false)
    private Integer usedCount;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        usedCount = 0;
        isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validTo);
    }

    public boolean isNotYetValid() {
        return LocalDateTime.now().isBefore(validFrom);
    }

    public boolean canBeUsed() {
        if (!isActive) return false;
        if (isExpired()) return false;
        if (isNotYetValid()) return false;
        if (usageLimit > 0 && usedCount >= usageLimit) return false;
        return true;
    }
}
