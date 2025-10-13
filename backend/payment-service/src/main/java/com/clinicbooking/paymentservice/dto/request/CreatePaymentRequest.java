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
public class CreatePaymentRequest {

    
    @NotNull(message = "ID lịch khám không được để trống")
    @Positive(message = "ID lịch khám phải là số dương")
    private Long appointmentId;

    
    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền tối thiểu là 1.000 VND")
    @DecimalMax(value = "999999.99", message = "Số tiền tối đa là 999.999,99 VND")
    private BigDecimal amount;

    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    
    @Size(max = 50, message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod;

    
    @Size(min = 1, max = 255, message = "Tên bệnh nhân phải từ 1 đến 255 ký tự")
    private String patientName;

    
    @Size(min = 5, max = 255, message = "Email không hợp lệ")
    private String patientEmail;

    
    @Size(max = 20, message = "Số điện thoại không hợp lệ")
    private String patientPhone;

    
    private Long doctorId;

    
    @Size(max = 255, message = "Tên bác sĩ không hợp lệ")
    private String doctorName;

    
    @AssertTrue(message = "Số tiền không hợp lệ")
    private boolean isAmountValid() {
        if (amount == null) {
            return true;
        }

        return amount.scale() <= 2;
    }
}
