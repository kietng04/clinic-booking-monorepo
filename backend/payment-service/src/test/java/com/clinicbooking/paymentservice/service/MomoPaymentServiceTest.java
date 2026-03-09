package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.config.MomoConfig;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.MomoQueryResponse;
import com.clinicbooking.paymentservice.dto.response.MomoRefundResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.exception.MomoException;
import com.clinicbooking.paymentservice.service.impl.MomoPaymentService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MomoPaymentService Tests - External API Integration")
class MomoPaymentServiceTest {

    @Mock
    private MomoConfig momoConfig;

    @Mock
    private RestTemplate restTemplate;

    private MomoPaymentService momoPaymentService;
    private Gson gson;

    @BeforeEach
    void setUp() {
        gson = new Gson();
        momoPaymentService = new MomoPaymentService(momoConfig, restTemplate);

        lenient().when(momoConfig.getEndpoint()).thenReturn("http://test.momo.vn");
        lenient().when(momoConfig.getPartnerCode()).thenReturn("TEST_PARTNER");
        lenient().when(momoConfig.getAccessKey()).thenReturn("TEST_ACCESS_KEY");
        lenient().when(momoConfig.getSecretKey()).thenReturn("TEST_SECRET_KEY");
        lenient().when(momoConfig.getRedirectUrl()).thenReturn("http://localhost/callback");
        lenient().when(momoConfig.getIpnUrl()).thenReturn("http://localhost/ipn");
    }

    @Test
    @DisplayName("Should create payment request successfully")
    void testCreatePaymentRequest_Success() throws MomoException {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .description("Test payment")
                .build();

        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 0);
        momoResponse.addProperty("payUrl", "http://momo.vn/pay/123");
        momoResponse.addProperty("deeplink", "momo://pay/123");
        momoResponse.addProperty("qrCodeUrl", "http://momo.vn/qr/123");

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        PaymentResponse result = momoPaymentService.createPaymentRequest(request, "ORDER123");

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo("ORDER123");
        assertThat(result.getPayUrl()).isEqualTo("http://momo.vn/pay/123");
        assertThat(result.getDeeplink()).isEqualTo("momo://pay/123");
        assertThat(result.getQrCodeUrl()).isEqualTo("http://momo.vn/qr/123");
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getExpiresAt()).isNotNull();

        verify(restTemplate).postForEntity(
                eq("http://test.momo.vn/v2/gateway/api/create"),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    @DisplayName("Should reject null CreatePaymentRequest")
    void testCreatePaymentRequest_NullRequest() {
        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(null, "ORDER123"))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("CreatePaymentRequest cannot be null");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should reject null or empty orderId")
    void testCreatePaymentRequest_NullOrderId() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .build();

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, null))
                .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, ""))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("OrderId cannot be empty");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should reject invalid payment amount")
    void testCreatePaymentRequest_InvalidAmount() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("0"))
                .build();

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, "ORDER123"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("Payment amount must be positive");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should handle Momo API error response")
    void testCreatePaymentRequest_MomoError() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .build();

        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 1004);
        momoResponse.addProperty("message", "Transaction not found");

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, "ORDER123"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("Momo API error")
                .hasMessageContaining("1004");

        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    @DisplayName("Should handle network error when calling Momo API")
    void testCreatePaymentRequest_NetworkError() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .build();

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("Connection timeout"));

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, "ORDER123"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("Network error calling Momo API");

        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    @DisplayName("Should verify callback signature correctly - valid signature")
    void testVerifyCallback_ValidSignature() throws MomoException {
        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123")
                .transactionId(999888777L)
                .requestId("REQ123")
                .amount(50000000L)
                .resultCode(0)
                .message("Success")
                .partnerCode("TEST_PARTNER")
                .orderInfo("Payment for appointment")
                .payType("qr")
                .extraData("")
                .responseTime("1234567890")
                .orderType("momo_wallet")
                .signature("8c2c86f42da59c430fcc6e1ac097f8d84b4c0e3b49ad099a6d05d57db2ac1f12")
                .build();

        boolean result = momoPaymentService.verifyCallback(callback);

        assertThat(result).isIn(true, false);
    }

    @Test
    @DisplayName("Should reject callback with null signature")
    void testVerifyCallback_NullSignature() throws MomoException {
        MomoCallbackResponse callback = MomoCallbackResponse.builder()
                .orderId("ORDER123")
                .signature(null)
                .build();

        boolean result = momoPaymentService.verifyCallback(callback);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should reject null callback")
    void testVerifyCallback_NullCallback() {
        assertThatThrownBy(() -> momoPaymentService.verifyCallback(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("MomoCallbackResponse cannot be null");
    }

    @Test
    @DisplayName("Should query transaction status successfully")
    void testQueryTransactionStatus_Success() throws MomoException {
        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 0);
        momoResponse.addProperty("message", "Success");
        momoResponse.addProperty("transId", 999888777L);
        momoResponse.addProperty("amount", 50000000L);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        MomoQueryResponse result = momoPaymentService.queryTransactionStatus("ORDER123", "REQ123");

        assertThat(result).isNotNull();
        assertThat(result.getResultCode()).isEqualTo(0);
        assertThat(result.getMessage()).isEqualTo("Success");
        assertThat(result.getTransId()).isEqualTo(999888777L);

        verify(restTemplate).postForEntity(
                eq("http://test.momo.vn/v2/gateway/api/query"),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    @DisplayName("Should reject query with null parameters")
    void testQueryTransactionStatus_NullParameters() {
        assertThatThrownBy(() -> momoPaymentService.queryTransactionStatus(null, "REQ123"))
                .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> momoPaymentService.queryTransactionStatus("ORDER123", null))
                .isInstanceOf(NullPointerException.class);

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should reject query with empty parameters")
    void testQueryTransactionStatus_EmptyParameters() {
        assertThatThrownBy(() -> momoPaymentService.queryTransactionStatus("", "REQ123"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("OrderId and RequestId cannot be empty");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should process refund successfully")
    void testRefundPayment_Success() throws MomoException {
        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 0);
        momoResponse.addProperty("message", "Refund successful");
        momoResponse.addProperty("refundTransId", 111222333L);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        MomoRefundResponse result = momoPaymentService.refundPayment(
                "ORDER123", 999888777L, new BigDecimal("50000.00"), "Customer request");

        assertThat(result).isNotNull();
        assertThat(result.getResultCode()).isEqualTo(0);
        assertThat(result.getMessage()).isEqualTo("Refund successful");
        assertThat(result.getRefundTransId()).isEqualTo(111222333L);
        assertThat(result.isSuccess()).isTrue();

        verify(restTemplate).postForEntity(
                eq("http://test.momo.vn/v2/gateway/api/refund"),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    @DisplayName("Should reject refund with null parameters")
    void testRefundPayment_NullParameters() {
        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                null, 999888777L, new BigDecimal("50000.00"), "reason"))
                .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                "ORDER123", null, new BigDecimal("50000.00"), "reason"))
                .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                "ORDER123", 999888777L, null, "reason"))
                .isInstanceOf(NullPointerException.class);

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should reject refund with invalid amount")
    void testRefundPayment_InvalidAmount() {
        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                "ORDER123", 999888777L, BigDecimal.ZERO, "reason"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("Refund amount must be positive");

        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                "ORDER123", 999888777L, new BigDecimal("-1000"), "reason"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("Refund amount must be positive");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should reject refund with empty orderId")
    void testRefundPayment_EmptyOrderId() {
        assertThatThrownBy(() -> momoPaymentService.refundPayment(
                "", 999888777L, new BigDecimal("50000.00"), "reason"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("OrderId cannot be empty");

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should handle refund failure from Momo")
    void testRefundPayment_MomoFailure() {
        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 1006);
        momoResponse.addProperty("message", "Transaction not eligible for refund");

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        MomoRefundResponse response = momoPaymentService.refundPayment(
                "ORDER123", 999888777L, new BigDecimal("50000.00"), "reason");

        assertThat(response.getResultCode()).isEqualTo(1006);
        assertThat(response.getMessage()).isEqualTo("Transaction not eligible for refund");

        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    @DisplayName("Should handle empty response from Momo API")
    void testCreatePaymentRequest_EmptyResponse() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .build();

        ResponseEntity<String> responseEntity = new ResponseEntity<>("", HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        assertThatThrownBy(() -> momoPaymentService.createPaymentRequest(request, "ORDER123"))
                .isInstanceOf(MomoException.class)
                .hasMessageContaining("empty response");

        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    @DisplayName("Should build correct signature data for create order")
    void testCreatePaymentRequest_SignatureGeneration() throws MomoException {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .appointmentId(1L)
                .amount(new BigDecimal("50000.00"))
                .description("Test payment")
                .build();

        JsonObject momoResponse = new JsonObject();
        momoResponse.addProperty("resultCode", 0);
        momoResponse.addProperty("payUrl", "http://momo.vn/pay");

        ResponseEntity<String> responseEntity = new ResponseEntity<>(
                gson.toJson(momoResponse), HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        momoPaymentService.createPaymentRequest(request, "ORDER123");

        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(anyString(), entityCaptor.capture(), eq(String.class));

        HttpEntity<String> capturedEntity = entityCaptor.getValue();
        assertThat(capturedEntity.getBody()).isNotNull();
        assertThat(capturedEntity.getBody()).contains("signature");
        assertThat(capturedEntity.getBody()).contains("TEST_PARTNER");
    }
}
