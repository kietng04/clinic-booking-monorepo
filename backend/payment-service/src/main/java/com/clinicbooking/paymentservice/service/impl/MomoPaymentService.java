package com.clinicbooking.paymentservice.service.impl;

import com.clinicbooking.paymentservice.config.MomoConfig;
import com.clinicbooking.paymentservice.dto.request.CreatePaymentRequest;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.dto.response.MomoQueryResponse;
import com.clinicbooking.paymentservice.dto.response.MomoRefundResponse;
import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.exception.MomoException;
import com.clinicbooking.paymentservice.service.IMomoPaymentService;
import com.clinicbooking.paymentservice.util.SignatureUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class MomoPaymentService implements IMomoPaymentService {

    private static final String MOMO_CREATE_ORDER_ENDPOINT = "/v2/gateway/api/create";
    private static final String MOMO_QUERY_STATUS_ENDPOINT = "/v2/gateway/api/query";
    private static final String MOMO_REFUND_ENDPOINT = "/v2/gateway/api/refund";

    private static final String REQUEST_TYPE_CAPTURE_WALLET = "captureWallet";
    private static final String REQUEST_TYPE_QUERY = "queryTransactionStatus";
    private static final String REQUEST_TYPE_REFUND = "refundTransaction";

    private static final String CURRENCY_VND = "VND";
    private static final int RESULT_CODE_SUCCESS = 0;
    private static final int RESULT_CODE_QR_TEMPORARY_FAILURE = 98;
    private static final int MAX_CREATE_ORDER_ATTEMPTS = 2;
    private static final int ORDER_INFO_MAX_LENGTH = 120;
    private static final long PAYMENT_EXPIRY_MINUTES = 15;

    private final MomoConfig momoConfig;
    private final RestTemplate restTemplate;
    private final Gson gson;

    
    @Autowired
    public MomoPaymentService(MomoConfig momoConfig, RestTemplate restTemplate) {
        this.momoConfig = momoConfig;
        this.restTemplate = restTemplate;
        this.gson = new Gson();
        log.info("MomoPaymentService initialized with endpoint: {}", momoConfig.getEndpoint());
    }

    
    @Override
    public PaymentResponse createPaymentRequest(CreatePaymentRequest request, String orderId) throws MomoException {

        Objects.requireNonNull(request, "CreatePaymentRequest cannot be null");
        Objects.requireNonNull(orderId, "OrderId cannot be null");

        if (orderId.trim().isEmpty()) {
            throw new MomoException("OrderId cannot be empty", HttpStatus.BAD_REQUEST, "INVALID_ORDER_ID");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new MomoException("Payment amount must be positive", HttpStatus.BAD_REQUEST, "INVALID_AMOUNT");
        }

        log.info("Creating payment request for orderId: {}, appointmentId: {}, amount: {}",
                orderId, request.getAppointmentId(), request.getAmount());

        try {
            Long amountVND = request.getAmount().longValue();
            log.debug("Amount in VND: {}", amountVND);

            String orderInfo = prepareOrderInfo(request);
            log.debug("Order info: {}", orderInfo);

            String endpoint = momoConfig.getEndpoint() + MOMO_CREATE_ORDER_ENDPOINT;
            log.info("Calling Momo API at endpoint: {}", endpoint);

            MomoException lastCreateOrderError = null;

            for (int attempt = 1; attempt <= MAX_CREATE_ORDER_ATTEMPTS; attempt++) {
                String requestId = UUID.randomUUID().toString();
                log.debug("Generated requestId: {}", requestId);

                String rawSignature = buildCreateOrderSignatureData(
                        momoConfig.getAccessKey(),
                        amountVND,
                        "",
                        momoConfig.getIpnUrl(),
                        orderId,
                        orderInfo,
                        momoConfig.getPartnerCode(),
                        momoConfig.getRedirectUrl(),
                        requestId,
                        REQUEST_TYPE_CAPTURE_WALLET
                );
                log.debug("Signature data prepared for orderId: {}", orderId);

                String signature = SignatureUtil.generateHmacSHA256(rawSignature, momoConfig.getSecretKey());
                log.debug("Generated HMAC-SHA256 signature for orderId: {}", orderId);

                JsonObject requestPayload = buildCreateOrderPayload(
                        orderId,
                        requestId,
                        amountVND,
                        orderInfo,
                        signature
                );
                log.debug("Request payload keys: {}", requestPayload.keySet());

                JsonObject momoResponse = callMomoApi(endpoint, requestPayload.toString());
                log.debug("Momo response: {}", momoResponse);

                Integer resultCode = momoResponse.get("resultCode").getAsInt();
                log.info("Momo API response resultCode: {}", resultCode);

                if (resultCode == RESULT_CODE_SUCCESS) {
                    String payUrl = momoResponse.has("payUrl") ?
                            momoResponse.get("payUrl").getAsString() : null;
                    String deeplink = momoResponse.has("deeplink") ?
                            momoResponse.get("deeplink").getAsString() : null;
                    String qrCodeUrl = momoResponse.has("qrCodeUrl") ?
                            momoResponse.get("qrCodeUrl").getAsString() : null;

                    log.info("Payment created successfully - orderId: {}, payUrl available: {}, deeplink available: {}, qrCode available: {}",
                            orderId, payUrl != null, deeplink != null, qrCodeUrl != null);

                    LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(PAYMENT_EXPIRY_MINUTES);

                    PaymentResponse response = PaymentResponse.builder()
                            .orderId(orderId)
                            .payUrl(payUrl)
                            .deeplink(deeplink)
                            .qrCodeUrl(qrCodeUrl)
                            .amount(request.getAmount())
                            .status("PENDING")
                            .currency(CURRENCY_VND)
                            .expiresAt(expiresAt)
                            .transactionId(null)
                            .build();

                    log.debug("Returning PaymentResponse with orderId: {}", orderId);
                    return response;
                }

                String message = momoResponse.has("message") ?
                        momoResponse.get("message").getAsString() : "Unknown error";
                log.error("Momo API error: resultCode={}, message={}", resultCode, message);

                lastCreateOrderError = new MomoException(
                        String.format("Momo API error: %s (code: %d)", message, resultCode),
                        HttpStatus.BAD_GATEWAY,
                        "MOMO_CREATE_ORDER_FAILED"
                );

                if (resultCode == RESULT_CODE_QR_TEMPORARY_FAILURE && attempt < MAX_CREATE_ORDER_ATTEMPTS) {
                    log.warn("Retrying Momo create order for orderId {} after temporary QR failure (attempt {}/{})",
                            orderId, attempt + 1, MAX_CREATE_ORDER_ATTEMPTS);
                    continue;
                }

                throw lastCreateOrderError;
            }

            throw lastCreateOrderError != null
                    ? lastCreateOrderError
                    : new MomoException("Failed to create payment request", HttpStatus.BAD_GATEWAY, "MOMO_CREATE_ORDER_FAILED");

        } catch (MomoException e) {
            log.error("MomoException while creating payment request for orderId: {}", orderId, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating payment request for orderId: {}", orderId, e);
            throw new MomoException(
                    "Failed to create payment request: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "PAYMENT_REQUEST_CREATION_ERROR",
                    e
            );
        }
    }

    
    @Override
    public boolean verifyCallback(MomoCallbackResponse callback) throws MomoException {

        Objects.requireNonNull(callback, "MomoCallbackResponse cannot be null");

        log.info("Verifying callback signature for orderId: {}, transId: {}",
                callback.getOrderId(), callback.getTransactionId());

        try {
            if (callback.getSignature() == null) {
                log.warn("Callback signature is null");
                return false;
            }

            String rawData = buildCallbackSignatureData(callback);
            log.debug("Callback signature verification prepared for orderId: {}", callback.getOrderId());

            boolean isValid = SignatureUtil.verifySignature(
                    callback.getSignature(),
                    rawData,
                    momoConfig.getSecretKey()
            );

            if (isValid) {
                log.info("Callback signature verification successful for orderId: {}", callback.getOrderId());
            } else {
                log.warn("Callback signature verification failed for orderId: {}. " +
                        "Expected signature differs from received signature.", callback.getOrderId());
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error during callback signature verification for orderId: {}", callback.getOrderId(), e);
            throw new MomoException(
                    "Callback signature verification error: " + e.getMessage(),
                    HttpStatus.UNAUTHORIZED,
                    "SIGNATURE_VERIFICATION_ERROR",
                    e
            );
        }
    }

    
    @Override
    public MomoQueryResponse queryTransactionStatus(String orderId, String requestId) throws MomoException {

        Objects.requireNonNull(orderId, "OrderId cannot be null");
        Objects.requireNonNull(requestId, "RequestId cannot be null");

        if (orderId.trim().isEmpty() || requestId.trim().isEmpty()) {
            throw new MomoException("OrderId and RequestId cannot be empty", HttpStatus.BAD_REQUEST, "INVALID_PARAMETERS");
        }

        log.info("Querying transaction status for orderId: {}, requestId: {}", orderId, requestId);

        try {

            String queryRequestId = UUID.randomUUID().toString();

            String rawSignature = buildQueryStatusSignatureData(
                    momoConfig.getAccessKey(),
                    orderId,
                    momoConfig.getPartnerCode(),
                    queryRequestId,
                    REQUEST_TYPE_QUERY
            );

            String signature = SignatureUtil.generateHmacSHA256(rawSignature, momoConfig.getSecretKey());
            log.debug("Generated signature for query request");

            JsonObject requestPayload = buildQueryStatusPayload(
                    orderId,
                    queryRequestId,
                    signature
            );

            String endpoint = momoConfig.getEndpoint() + MOMO_QUERY_STATUS_ENDPOINT;
            log.info("Calling Momo query API at endpoint: {}", endpoint);

            JsonObject momoResponse = callMomoApi(endpoint, requestPayload.toString());
            log.debug("Momo query response: {}", momoResponse);

            Integer resultCode = momoResponse.get("resultCode").getAsInt();
            String message = momoResponse.has("message") ?
                    momoResponse.get("message").getAsString() : "No message";

            log.info("Momo query response - resultCode: {}, message: {}", resultCode, message);

            MomoQueryResponse response = MomoQueryResponse.builder()
                    .resultCode(resultCode)
                    .message(message)
                    .orderId(orderId)
                    .requestId(queryRequestId)
                    .transId(momoResponse.has("transId") ?
                            momoResponse.get("transId").getAsLong() : null)
                    .amount(momoResponse.has("amount") ?
                            momoResponse.get("amount").getAsLong() : null)
                    .build();

            log.debug("Returning MomoQueryResponse for orderId: {}", orderId);
            return response;

        } catch (Exception e) {
            log.error("Error while querying transaction status for orderId: {}", orderId, e);
            throw new MomoException(
                    "Failed to query transaction status: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY,
                    "QUERY_STATUS_ERROR",
                    e
            );
        }
    }

    
    @Override
    public MomoRefundResponse refundPayment(String orderId, Long transId, BigDecimal amount, String reason) throws MomoException {

        Objects.requireNonNull(orderId, "OrderId cannot be null");
        Objects.requireNonNull(transId, "TransId cannot be null");
        Objects.requireNonNull(amount, "Amount cannot be null");

        if (orderId.trim().isEmpty()) {
            throw new MomoException("OrderId cannot be empty", HttpStatus.BAD_REQUEST, "INVALID_ORDER_ID");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MomoException("Refund amount must be positive", HttpStatus.BAD_REQUEST, "INVALID_AMOUNT");
        }

        log.info("Processing refund for orderId: {}, transId: {}, amount: {}, reason: {}",
                orderId, transId, amount, reason);

        try {

            String refundRequestId = UUID.randomUUID().toString();

            Long amountVND = amount.longValue();

            String rawSignature = buildRefundSignatureData(
                    momoConfig.getAccessKey(),
                    amountVND,
                    "",
                    orderId,
                    momoConfig.getPartnerCode(),
                    refundRequestId,
                    REQUEST_TYPE_REFUND,
                    transId
            );

            String signature = SignatureUtil.generateHmacSHA256(rawSignature, momoConfig.getSecretKey());
            log.debug("Generated signature for refund request");

            JsonObject requestPayload = buildRefundPayload(
                    orderId,
                    refundRequestId,
                    amountVND,
                    transId,
                    reason,
                    signature
            );

            String endpoint = momoConfig.getEndpoint() + MOMO_REFUND_ENDPOINT;
            log.info("Calling Momo refund API at endpoint: {}", endpoint);

            JsonObject momoResponse = callMomoApi(endpoint, requestPayload.toString());
            log.debug("Momo refund response: {}", momoResponse);

            Integer resultCode = momoResponse.get("resultCode").getAsInt();
            String message = momoResponse.has("message") ?
                    momoResponse.get("message").getAsString() : "No message";

            log.info("Momo refund response - resultCode: {}, message: {}", resultCode, message);

            MomoRefundResponse response = MomoRefundResponse.builder()
                    .resultCode(resultCode)
                    .message(message)
                    .orderId(orderId)
                    .refundTransId(momoResponse.has("refundTransId") ?
                            momoResponse.get("refundTransId").getAsLong() : null)
                    .transId(transId)
                    .amount(amount.longValue())
                    .build();

            log.debug("Returning MomoRefundResponse for orderId: {}", orderId);
            return response;

        } catch (Exception e) {
            log.error("Error while processing refund for orderId: {}", orderId, e);
            throw new MomoException(
                    "Failed to process refund: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY,
                    "REFUND_PROCESSING_ERROR",
                    e
            );
        }
    }

    
    private String prepareOrderInfo(CreatePaymentRequest request) {
        String baseInfo = String.format("Payment for appointment %d", request.getAppointmentId());
        return baseInfo.length() <= ORDER_INFO_MAX_LENGTH
                ? baseInfo
                : baseInfo.substring(0, ORDER_INFO_MAX_LENGTH);
    }

    
    private String buildCreateOrderSignatureData(String accessKey, Long amount, String extraData,
                                                  String ipnUrl, String orderId, String orderInfo,
                                                  String partnerCode, String redirectUrl,
                                                  String requestId, String requestType) {
        return "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;
    }

    
    private JsonObject buildCreateOrderPayload(String orderId, String requestId, Long amount, String orderInfo, String signature) {
        JsonObject payload = new JsonObject();
        payload.addProperty("partnerCode", momoConfig.getPartnerCode());
        payload.addProperty("partnerName", "Clinic Booking System");
        payload.addProperty("partnerUserid", "admin@clinic");
        payload.addProperty("accessKey", momoConfig.getAccessKey());
        payload.addProperty("requestId", requestId);
        payload.addProperty("amount", amount);
        payload.addProperty("orderId", orderId);
        payload.addProperty("orderInfo", orderInfo);
        payload.addProperty("redirectUrl", momoConfig.getRedirectUrl());
        payload.addProperty("ipnUrl", momoConfig.getIpnUrl());
        payload.addProperty("lang", "vi");
        payload.addProperty("extraData", "");
        payload.addProperty("requestType", REQUEST_TYPE_CAPTURE_WALLET);
        payload.addProperty("signature", signature);
        return payload;
    }

    
    private String buildQueryStatusSignatureData(String accessKey, String orderId, String partnerCode, String requestId, String requestType) {
        return "accessKey=" + accessKey +
                "&orderId=" + orderId +
                "&partnerCode=" + partnerCode +
                "&requestId=" + requestId +
                "&requestType=" + requestType;
    }

    
    private JsonObject buildQueryStatusPayload(String orderId, String requestId, String signature) {
        JsonObject payload = new JsonObject();
        payload.addProperty("partnerCode", momoConfig.getPartnerCode());
        payload.addProperty("accessKey", momoConfig.getAccessKey());
        payload.addProperty("requestId", requestId);
        payload.addProperty("orderId", orderId);
        payload.addProperty("lang", "vi");
        payload.addProperty("requestType", REQUEST_TYPE_QUERY);
        payload.addProperty("signature", signature);
        return payload;
    }

    
    private String buildRefundSignatureData(String accessKey, Long amount, String extraData,
                                            String orderId, String partnerCode, String requestId,
                                            String requestType, Long transId) {
        return "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&orderId=" + orderId +
                "&partnerCode=" + partnerCode +
                "&requestId=" + requestId +
                "&requestType=" + requestType +
                "&transId=" + transId;
    }

    
    private JsonObject buildRefundPayload(String orderId, String requestId, Long amount, Long transId, String reason, String signature) {
        JsonObject payload = new JsonObject();
        payload.addProperty("partnerCode", momoConfig.getPartnerCode());
        payload.addProperty("accessKey", momoConfig.getAccessKey());
        payload.addProperty("requestId", requestId);
        payload.addProperty("orderId", orderId);
        payload.addProperty("amount", amount);
        payload.addProperty("transId", transId);
        payload.addProperty("lang", "vi");
        payload.addProperty("description", reason != null ? reason : "Refund request");
        payload.addProperty("extraData", "");
        payload.addProperty("requestType", REQUEST_TYPE_REFUND);
        payload.addProperty("signature", signature);
        return payload;
    }

    
    private String buildCallbackSignatureData(MomoCallbackResponse callback) {
        return "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + callback.getAmount() +
                "&extraData=" + (callback.getExtraData() != null ? callback.getExtraData() : "") +
                "&message=" + (callback.getMessage() != null ? callback.getMessage() : "") +
                "&orderId=" + callback.getOrderId() +
                "&orderInfo=" + (callback.getOrderInfo() != null ? callback.getOrderInfo() : "") +
                "&orderType=" + (callback.getOrderType() != null ? callback.getOrderType() : "") +
                "&partnerCode=" + callback.getPartnerCode() +
                "&payType=" + (callback.getPayType() != null ? callback.getPayType() : "") +
                "&requestId=" + callback.getRequestId() +
                "&responseTime=" + (callback.getResponseTime() != null ? callback.getResponseTime() : "") +
                "&resultCode=" + callback.getResultCode() +
                "&transId=" + callback.getTransactionId();
    }

    
    private JsonObject callMomoApi(String endpoint, String payload) throws MomoException {
        try {
            log.debug("Making HTTP POST request to Momo API");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.add("User-Agent", "Clinic-Payment-Service/1.0");

            HttpEntity<String> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request, String.class);
            log.debug("Momo API response status: {}", response.getStatusCode());

            if (response.getBody() == null || response.getBody().isEmpty()) {
                log.error("Momo API returned empty response");
                throw new MomoException(
                        "Momo API returned empty response",
                        HttpStatus.BAD_GATEWAY,
                        "EMPTY_RESPONSE"
                );
            }

            JsonObject jsonResponse = gson.fromJson(response.getBody(), JsonObject.class);
            log.debug("Successfully parsed Momo response");
            return jsonResponse;

        } catch (RestClientException e) {
            log.error("RestTemplate error calling Momo API: {}", e.getMessage());
            throw new MomoException(
                    "Network error calling Momo API: " + e.getMessage(),
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "MOMO_API_NETWORK_ERROR",
                    e
            );
        } catch (Exception e) {
            log.error("Unexpected error calling Momo API: {}", e.getMessage());
            throw new MomoException(
                    "Error calling Momo API: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY,
                    "MOMO_API_ERROR",
                    e
            );
        }
    }
}
