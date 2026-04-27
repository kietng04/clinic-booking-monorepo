package com.clinicbooking.paymentservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentPaymentSyncClient {

    private final RestTemplate restTemplate;

    @Value("${services.appointment-service.url:http://localhost:8082}")
    private String appointmentServiceUrl;

    public void linkPaymentOrder(
            Long appointmentId,
            String paymentOrderId,
            String paymentMethod,
            LocalDateTime paymentExpiresAt
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("paymentOrderId", paymentOrderId);
        payload.put("paymentMethod", paymentMethod);
        payload.put("paymentExpiresAt", paymentExpiresAt != null ? paymentExpiresAt.toString() : null);

        patchAppointment(appointmentId, "/payment-link", payload);
    }

    public void updatePaymentStatus(
            Long appointmentId,
            String paymentStatus,
            String paymentMethod,
            LocalDateTime paymentExpiresAt,
            LocalDateTime paymentCompletedAt
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("paymentStatus", paymentStatus);
        payload.put("paymentMethod", paymentMethod);
        payload.put("paymentExpiresAt", paymentExpiresAt != null ? paymentExpiresAt.toString() : null);
        payload.put("paymentCompletedAt", paymentCompletedAt != null ? paymentCompletedAt.toString() : null);

        patchAppointment(appointmentId, "/payment-status", payload);
    }

    private void patchAppointment(Long appointmentId, String suffix, Map<String, Object> payload) {
        String url = appointmentServiceUrl + "/api/appointments/" + appointmentId + suffix;

        try {
            restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    new HttpEntity<>(payload, new HttpHeaders()),
                    Void.class
            );
            log.info("Synced payment state to appointment {} via {}", appointmentId, suffix);
        } catch (RestClientException ex) {
            log.warn("Failed to sync payment state to appointment {} via {}: {}", appointmentId, suffix, ex.getMessage());
        }
    }
}
