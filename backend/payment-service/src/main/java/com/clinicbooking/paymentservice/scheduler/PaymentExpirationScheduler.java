package com.clinicbooking.paymentservice.scheduler;

import com.clinicbooking.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentExpirationScheduler {

    private final IPaymentService paymentService;

    @Scheduled(fixedDelayString = "${payment.expiration.scan-delay-ms:60000}")
    public void expireOverduePayments() {
        int expiredCount = paymentService.expireOverduePayments();
        if (expiredCount > 0) {
            log.info("Expired {} overdue payment order(s)", expiredCount);
        }
    }
}
