package com.clinicbooking.paymentservice.controller;

import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.request.RefundPaymentRequest;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.exception.PaymentNotFoundException;
import com.clinicbooking.paymentservice.security.CustomUserDetails;
import com.clinicbooking.paymentservice.service.IPaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("PaymentController Integration Tests")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IPaymentService paymentService;

    private CreatePaymentRequest createPaymentRequest;
    private PaymentResponse paymentResponse;
    private CustomUserDetails patientDetails;

    @BeforeEach
    void setUp() {
        createPaymentRequest = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .description("Test appointment payment")
                .paymentMethod("MOMO_WALLET")
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorId(200L)
                .doctorName("Dr. Smith")
                .build();

        paymentResponse = PaymentResponse.builder()
                .orderId("ORDER123456789")
                .patientId(100L)
                .payUrl("http://momo.vn/pay/123")
                .deeplink("momo://pay/123")
                .qrCodeUrl("http://momo.vn/qr/123")
                .amount(new BigDecimal("50000.00"))
                .status("PENDING")
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET.name())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        patientDetails = CustomUserDetails.builder()
                .userId(100L)
                .email("patient@test.com")
                .role("PATIENT")
                .build();

    }

    @Test
    @DisplayName("Should create payment successfully")
    void testCreatePayment_Success() throws Exception {
        when(paymentService.createPayment(any(CreatePaymentRequest.class), anyLong()))
                .thenReturn(paymentResponse);

        mockMvc.perform(post("/api/payments")
                        .with(csrf())
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPaymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("ORDER123456789"))
                .andExpect(jsonPath("$.payUrl").value("http://momo.vn/pay/123"))
                .andExpect(jsonPath("$.amount").value(50000.00))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("Should reject payment with invalid amount")
    void testCreatePayment_InvalidAmount() throws Exception {
        createPaymentRequest.setAmount(new BigDecimal("100"));

        mockMvc.perform(post("/api/payments")
                        .with(csrf())
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPaymentRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reject payment with missing appointment ID")
    void testCreatePayment_MissingAppointmentId() throws Exception {
        createPaymentRequest.setAppointmentId(null);

        mockMvc.perform(post("/api/payments")
                        .with(csrf())
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPaymentRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get payment by order ID")
    void testGetPaymentByOrderId_Success() throws Exception {
        when(paymentService.getPaymentByOrderId("ORDER123456789"))
                .thenReturn(paymentResponse);

        mockMvc.perform(get("/api/payments/ORDER123456789")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ORDER123456789"))
                .andExpect(jsonPath("$.amount").value(50000.00));
    }

    @Test
    @DisplayName("Should return 404 when payment not found")
    void testGetPaymentByOrderId_NotFound() throws Exception {
        when(paymentService.getPaymentByOrderId("NOTFOUND"))
                .thenThrow(new PaymentNotFoundException("NOTFOUND"));

        mockMvc.perform(get("/api/payments/NOTFOUND")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should export payment history as CSV")
    void testExportPaymentHistoryCsv() throws Exception {
        byte[] csvBytes = "orderId,amount\nORDER123456789,50000.00\n".getBytes();
        when(paymentService.exportPatientPaymentsCsv(anyLong(), any(), any()))
                .thenReturn(csvBytes);

        mockMvc.perform(get("/api/payments/my-payments/export")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.TEXT_PLAIN))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=payment-history.csv"));
    }

    @Test
    @DisplayName("Should create refund request")
    void testRefundPayment_Success() throws Exception {
        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("50000.00"))
                .reason("Customer requested refund")
                .build();

        IPaymentService.RefundResponse refundResponse =
                new IPaymentService.RefundResponse("REFUND123", "COMPLETED", new BigDecimal("50000.00"));

        when(paymentService.refundPayment(any(RefundPaymentRequest.class)))
                .thenReturn(refundResponse);
        when(paymentService.getPaymentByOrderId("ORDER123456789"))
                .thenReturn(paymentResponse);

        mockMvc.perform(post("/api/payments/refund")
                        .with(csrf())
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.refundId").value("REFUND123"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.amount").value(50000.00));
    }

    @Test
    @DisplayName("Should reject refund with invalid reason")
    void testRefundPayment_InvalidReason() throws Exception {
        RefundPaymentRequest refundRequest = RefundPaymentRequest.builder()
                .orderId("ORDER123456789")
                .amount(new BigDecimal("50000.00"))
                .reason("bad")
                .build();

        mockMvc.perform(post("/api/payments/refund")
                        .with(csrf())
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundRequest)))
                .andExpect(status().isBadRequest());
    }
}
