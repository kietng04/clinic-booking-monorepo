package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String code;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal maxDiscount;
    private BigDecimal minPurchaseAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private Boolean canBeUsed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
