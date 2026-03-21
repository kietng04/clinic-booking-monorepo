package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.PaymentReportSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(
        name = "payment-service",
        url = "${services.payment-service.url:http://payment-service:8084}",
        fallback = PaymentServiceClientFallback.class
)
public interface PaymentServiceClient {

    @GetMapping("/api/payments/internal/statistics/report-summary")
    PaymentReportSummaryDto getReportSummary();
}
