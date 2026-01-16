package com.clinicbooking.paymentservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating non-financial payment fields
 * Financial fields (amount, status) should not be updated directly
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePaymentRequest {

    /**
     * Updated description for the payment order
     */
    private String description;
}
