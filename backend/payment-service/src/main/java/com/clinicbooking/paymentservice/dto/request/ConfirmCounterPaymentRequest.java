package com.clinicbooking.paymentservice.dto.request;

import com.clinicbooking.paymentservice.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for confirming counter payment by receptionist
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmCounterPaymentRequest {

    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;

    // Server-populated field - set from authenticated user in controller
    private Long confirmedByUserId;

    private String note;

    // Server-populated field - set from authenticated user in controller
    private String receptionistName;
}
