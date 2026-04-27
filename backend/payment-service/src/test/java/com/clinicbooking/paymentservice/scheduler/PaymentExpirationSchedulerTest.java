package com.clinicbooking.paymentservice.scheduler;

import com.clinicbooking.paymentservice.service.IPaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentExpirationSchedulerTest {

    @Mock
    private IPaymentService paymentService;

    @InjectMocks
    private PaymentExpirationScheduler paymentExpirationScheduler;

    @Test
    void shouldDelegateOverdueExpirationToPaymentService() {
        when(paymentService.expireOverduePayments()).thenReturn(2);

        paymentExpirationScheduler.expireOverduePayments();

        verify(paymentService).expireOverduePayments();
    }
}
