package com.clinicbooking.paymentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryPaymentRequest {

    
    @NotBlank(message = "ID đơn hàng không được để trống")
    @Size(max = 50, message = "ID đơn hàng không hợp lệ")
    private String orderId;

    
    @Size(max = 50, message = "ID yêu cầu không hợp lệ")
    private String requestId;
}
