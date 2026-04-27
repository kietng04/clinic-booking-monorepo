package com.clinicbooking.paymentservice.integration;

import com.clinicbooking.paymentservice.client.AppointmentPaymentSyncClient;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import com.clinicbooking.paymentservice.repository.PaymentOrderRepository;
import com.clinicbooking.paymentservice.service.IMomoPaymentService;
import com.clinicbooking.paymentservice.service.IPaymentEventPublisher;
import com.clinicbooking.paymentservice.service.impl.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Payment Retry Integration Tests")
class PaymentRetryIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @MockBean
    private IMomoPaymentService momoPaymentService;

    @MockBean
    private IPaymentEventPublisher eventPublisher;

    @MockBean
    private AppointmentPaymentSyncClient appointmentPaymentSyncClient;

    @MockBean(name = "cacheManager")
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        paymentOrderRepository.deleteAll();
        when(cacheManager.getCache("paymentOrders")).thenReturn(new ConcurrentMapCache("paymentOrders"));
    }

    @Test
    @DisplayName("Should create a new payment after previous payment expired")
    void shouldCreateNewPaymentAfterPreviousPaymentExpired() throws Exception {
        paymentOrderRepository.save(PaymentOrder.builder()
                .orderId("ORDER-EXPIRED-1")
                .appointmentId(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("50000.00"))
                .currency("VND")
                .description("Expired appointment payment")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.EXPIRED)
                .expiredAt(LocalDateTime.now().minusMinutes(10))
                .build());

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .description("Retry appointment payment")
                .paymentMethod("MOMO_WALLET")
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorId(200L)
                .doctorName("Dr. Smith")
                .build();

        when(momoPaymentService.createPaymentRequest(any(), anyString()))
                .thenReturn(PaymentResponse.builder()
                        .orderId("ORDER-NEW-1")
                        .payUrl("http://momo.vn/pay")
                        .deeplink("momo://pay")
                        .qrCodeUrl("http://momo.vn/qr")
                        .expiresAt(LocalDateTime.now().plusMinutes(15))
                        .build());

        PaymentResponse response = paymentService.createPayment(request, 100L);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(paymentOrderRepository.findAll()).hasSize(2);
        assertThat(paymentService.getPaymentByAppointmentId(1L).getOrderId()).isEqualTo(response.getOrderId());
    }
}
