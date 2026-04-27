package com.clinicbooking.paymentservice.scheduler;

import com.clinicbooking.paymentservice.service.IPaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Payment Expiration Scheduler Component Tests")
class PaymentExpirationSchedulerComponentTest {

    @Autowired
    private PaymentExpirationScheduler paymentExpirationScheduler;

    @MockBean
    private IPaymentService paymentService;

    @Test
    @DisplayName("Should invoke payment service when scheduler runs")
    void shouldInvokePaymentServiceWhenSchedulerRuns() {
        when(paymentService.expireOverduePayments()).thenReturn(1);

        paymentExpirationScheduler.expireOverduePayments();

        verify(paymentService, atLeastOnce()).expireOverduePayments();
    }
}
