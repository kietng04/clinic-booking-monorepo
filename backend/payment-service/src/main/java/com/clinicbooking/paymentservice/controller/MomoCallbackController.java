package com.clinicbooking.paymentservice.controller;

import com.clinicbooking.paymentservice.config.MomoConfig;
import com.clinicbooking.paymentservice.dto.response.MomoCallbackResponse;
import com.clinicbooking.paymentservice.exception.DuplicatePaymentException;
import com.clinicbooking.paymentservice.exception.InvalidSignatureException;
import com.clinicbooking.paymentservice.exception.PaymentNotFoundException;
import com.clinicbooking.paymentservice.service.IPaymentService;
import com.clinicbooking.paymentservice.util.SignatureUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Momo Webhook", description = "Momo Payment Gateway Webhook Handler")
public class MomoCallbackController {

    private final IPaymentService paymentService;
    private final MomoConfig momoConfig;

    
    @PostMapping("/callback")
    @Operation(
            summary = "Momo Payment Webhook Callback",
            description = "Handle IPN callback from Momo payment gateway. Public endpoint, signature-verified only."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Callback processed successfully",
                    content = @Content(schema = @Schema(implementation = String.class, example = "OK"))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid callback data"),
            @ApiResponse(responseCode = "401", description = "Signature verification failed"),
            @ApiResponse(responseCode = "500", description = "Server error (Momo will retry)")
    })
    public ResponseEntity<String> handleMomoCallback(
            @RequestBody MomoCallbackResponse callbackData,
            HttpServletRequest request) {

        String orderId = callbackData.getOrderId();
        String requestId = callbackData.getRequestId();
        Integer resultCode = callbackData.getResultCode();
        String signature = callbackData.getSignature();

        log.info(
                "Momo callback received - OrderId: {}, RequestId: {}, ResultCode: {}, ResponseTime: {}, ClientIP: {}",
                orderId,
                requestId,
                resultCode,
                callbackData.getResponseTime(),
                getClientIp(request)
        );

        try {

            if (orderId == null || orderId.isEmpty()) {
                log.error("Callback missing orderId - RequestId: {}", requestId);
                return ResponseEntity.badRequest().body("Missing orderId");
            }

            if (resultCode == null) {
                log.error("Callback missing resultCode - OrderId: {}, RequestId: {}", orderId, requestId);
                return ResponseEntity.badRequest().body("Missing resultCode");
            }

            if (signature == null || signature.isEmpty()) {
                log.error("Callback missing signature - OrderId: {}, RequestId: {}", orderId, requestId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing signature");
            }

            try {

                String rawData = buildCallbackRawData(callbackData);

                boolean isValid = SignatureUtil.verifySignature(
                    signature,
                    rawData,
                    momoConfig.getSecretKey()
                );

                if (!isValid) {
                    log.error("SECURITY ALERT: Invalid Momo signature - OrderId: {}, RequestId: {}, ClientIP: {}",
                              orderId, requestId, getClientIp(request));
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                         .body("Invalid signature");
                }

                log.info("Signature verified successfully - OrderId: {}, RequestId: {}", orderId, requestId);
                callbackData.setSignatureVerified(true);

            } catch (Exception e) {
                log.error("Error verifying signature for order: {}", orderId, e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                     .body("Signature verification failed");
            }

            paymentService.handleMomoCallback(callbackData);

            if (resultCode == 0) {
                log.info(
                        "Payment successful - OrderId: {}, RequestId: {}, TransId: {}, Amount: {}",
                        orderId,
                        requestId,
                        callbackData.getTransactionId(),
                        callbackData.getAmount()
                );
            } else {
                log.warn(
                        "Payment failed - OrderId: {}, RequestId: {}, ResultCode: {}, Message: {}",
                        orderId,
                        requestId,
                        resultCode,
                        callbackData.getMessage()
                );
            }

            return ResponseEntity.ok("OK");

        } catch (PaymentNotFoundException ex) {

            log.warn(
                    "Payment order not found for callback - OrderId: {}, RequestId: {}",
                    orderId,
                    requestId,
                    ex
            );

            return ResponseEntity.ok("Order not found");

        } catch (DuplicatePaymentException ex) {

            log.info(
                    "Duplicate callback received (already processed) - OrderId: {}, RequestId: {}",
                    orderId,
                    requestId
            );

            return ResponseEntity.ok("OK");

        } catch (Exception ex) {

            log.error(
                    "Unexpected error processing Momo callback - OrderId: {}, RequestId: {}",
                    orderId,
                    requestId,
                    ex
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing error");
        }
    }

    
    private String buildCallbackRawData(MomoCallbackResponse callback) {
        return "accessKey=" + momoConfig.getAccessKey() +
               "&amount=" + callback.getAmount() +
               "&extraData=" + (callback.getExtraData() != null ? callback.getExtraData() : "") +
               "&message=" + (callback.getMessage() != null ? callback.getMessage() : "") +
               "&orderId=" + callback.getOrderId() +
               "&orderInfo=" + callback.getOrderInfo() +
               "&orderType=" + callback.getOrderType() +
               "&partnerCode=" + callback.getPartnerCode() +
               "&payType=" + callback.getPayType() +
               "&requestId=" + callback.getRequestId() +
               "&responseTime=" + callback.getResponseTime() +
               "&resultCode=" + callback.getResultCode() +
               "&transId=" + callback.getTransactionId();
    }

    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
