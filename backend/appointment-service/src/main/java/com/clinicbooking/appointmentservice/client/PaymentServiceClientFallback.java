package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.PaymentReportSummaryDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@Slf4j
public class PaymentServiceClientFallback implements PaymentServiceClient {

    @Override
    public PaymentReportSummaryDto getReportSummary() {
        log.warn("Fallback: Payment service is unavailable. Returning empty payment report summary");
        return PaymentReportSummaryDto.builder()
                .onlinePayment(0L)
                .cashPayment(0L)
                .monthlyTrend(Collections.emptyList())
                .build();
    }
}
