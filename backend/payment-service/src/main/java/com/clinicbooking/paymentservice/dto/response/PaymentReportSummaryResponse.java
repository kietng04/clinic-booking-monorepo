package com.clinicbooking.paymentservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReportSummaryResponse {
    private long onlinePayment;
    private long cashPayment;
    private List<MonthlyPaymentBreakdown> monthlyTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyPaymentBreakdown {
        private String month;
        private long online;
        private long cash;
    }
}
