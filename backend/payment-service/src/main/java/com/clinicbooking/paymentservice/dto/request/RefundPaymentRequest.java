package com.clinicbooking.paymentservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundPaymentRequest {

    
    @NotBlank(message = "ID đơn hàng không được để trống")
    @Size(max = 50, message = "ID đơn hàng không hợp lệ")
    private String orderId;

    
    @NotNull(message = "Số tiền hoàn tiền không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền hoàn tiền phải lớn hơn 0")
    @DecimalMax(value = "999999.99", message = "Số tiền hoàn tiền không hợp lệ")
    private BigDecimal amount;

    
    @NotBlank(message = "Lý do hoàn tiền không được để trống")
    @Size(min = 5, max = 500, message = "Lý do hoàn tiền phải có độ dài từ 5 đến 500 ký tự")
    private String reason;

    
    @AssertTrue(message = "Số tiền hoàn tiền không hợp lệ")
    private boolean isAmountValid() {
        if (amount == null) {
            return true;
        }

        return amount.scale() <= 2;
    }
}
