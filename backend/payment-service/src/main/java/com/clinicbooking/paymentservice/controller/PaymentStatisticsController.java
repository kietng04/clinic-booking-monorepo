package com.clinicbooking.paymentservice.controller;

import com.clinicbooking.paymentservice.dto.response.PaymentReportSummaryResponse;
import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import com.clinicbooking.paymentservice.repository.PaymentOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/internal/statistics")
@RequiredArgsConstructor
@Slf4j
public class PaymentStatisticsController {

    private final PaymentOrderRepository paymentOrderRepository;

    @GetMapping("/report-summary")
    public ResponseEntity<PaymentReportSummaryResponse> getReportSummary() {
        LocalDate today = LocalDate.now();
        YearMonth startMonth = YearMonth.from(today).minusMonths(11);
        LocalDateTime startTime = startMonth.atDay(1).atStartOfDay();
        LocalDateTime endTime = today.plusDays(1).atStartOfDay();

        Map<YearMonth, long[]> monthlyTotals = new LinkedHashMap<>();
        YearMonth cursor = startMonth;
        while (!cursor.isAfter(YearMonth.from(today))) {
            monthlyTotals.put(cursor, new long[] { 0L, 0L });
            cursor = cursor.plusMonths(1);
        }

        long onlineTotal = 0L;
        long cashTotal = 0L;

        List<PaymentOrder> completedOrders = paymentOrderRepository.findByStatus(PaymentStatus.COMPLETED);
        for (PaymentOrder order : completedOrders) {
            LocalDateTime referenceTime =
                    order.getCompletedAt() != null ? order.getCompletedAt() : order.getCreatedAt();
            if (referenceTime == null || referenceTime.isBefore(startTime) || !referenceTime.isBefore(endTime)) {
                continue;
            }

            long amount = order.getAmount() == null ? 0L : order.getAmount().longValue();
            PaymentMethod paymentMethod = order.getPaymentMethod();
            boolean isOnline = paymentMethod != null && paymentMethod.isOnlinePayment();
            boolean isCounter = paymentMethod != null && paymentMethod.requiresReceptionistConfirmation();
            if (!isOnline && !isCounter) {
                continue;
            }

            YearMonth orderMonth = YearMonth.from(referenceTime.toLocalDate());
            long[] breakdown = monthlyTotals.get(orderMonth);
            if (breakdown == null) {
                continue;
            }

            if (isOnline) {
                breakdown[0] += amount;
                onlineTotal += amount;
            } else {
                breakdown[1] += amount;
                cashTotal += amount;
            }
        }

        List<PaymentReportSummaryResponse.MonthlyPaymentBreakdown> monthlyTrend = new ArrayList<>();
        monthlyTotals.forEach((month, totals) -> monthlyTrend.add(
                PaymentReportSummaryResponse.MonthlyPaymentBreakdown.builder()
                        .month("Tháng " + month.getMonthValue())
                        .online(totals[0])
                        .cash(totals[1])
                        .build()
        ));

        log.info("Generated payment report summary with {} completed orders", completedOrders.size());
        return ResponseEntity.ok(
                PaymentReportSummaryResponse.builder()
                        .onlinePayment(onlineTotal)
                        .cashPayment(cashTotal)
                        .monthlyTrend(monthlyTrend)
                        .build()
        );
    }
}
