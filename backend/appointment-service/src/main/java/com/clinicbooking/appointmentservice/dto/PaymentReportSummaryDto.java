package com.clinicbooking.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReportSummaryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private long onlinePayment;
    private long cashPayment;
    private List<MonthlyPaymentBreakdownDto> monthlyTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyPaymentBreakdownDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private String month;
        private long online;
        private long cash;
    }
}
