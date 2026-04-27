package com.clinicbooking.paymentservice.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AppointmentPaymentSyncClientContractTest {

    private AppointmentPaymentSyncClient syncClient;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(new ObjectMapper().findAndRegisterModules());
        restTemplate.getMessageConverters().removeIf(MappingJackson2HttpMessageConverter.class::isInstance);
        restTemplate.getMessageConverters().add(converter);
        server = MockRestServiceServer.createServer(restTemplate);
        syncClient = new AppointmentPaymentSyncClient(restTemplate);
        ReflectionTestUtils.setField(syncClient, "appointmentServiceUrl", "http://localhost:8082");
    }

    @Test
    void shouldSendExpectedPayloadWhenUpdatingPaymentStatus() {
        LocalDateTime expiresAt = LocalDateTime.of(2026, 4, 18, 23, 0);
        LocalDateTime completedAt = LocalDateTime.of(2026, 4, 18, 22, 45);

        server.expect(requestTo("http://localhost:8082/api/appointments/1/payment-status"))
                .andExpect(method(HttpMethod.PATCH))
                .andExpect(content().json("""
                        {
                          "paymentStatus": "PAID",
                          "paymentMethod": "MOMO_WALLET",
                          "paymentExpiresAt": "2026-04-18T23:00",
                          "paymentCompletedAt": "2026-04-18T22:45"
                        }
                        """, true))
                .andRespond(withSuccess());

        syncClient.updatePaymentStatus(1L, "PAID", "MOMO_WALLET", expiresAt, completedAt);

        server.verify();
    }
}
