package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogEntry;
import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogPageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceCatalogServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ServiceCatalogService service;

    @BeforeEach
    void setUp() {
        service = new ServiceCatalogService(restTemplate);
        ReflectionTestUtils.setField(service, "appointmentServiceUrl", "http://localhost:8082");
        ReflectionTestUtils.setField(service, "fetchSize", 20);
        ReflectionTestUtils.setField(service, "maxResults", 5);
    }

    @Test
    void shouldFormatServiceCatalogAnswer() {
        MedicalServiceCatalogPageResponse page = new MedicalServiceCatalogPageResponse(
                List.of(
                        new MedicalServiceCatalogEntry(1L, 1L, "Kham tim mach - Goi 2", "CARDIO", true, null),
                        new MedicalServiceCatalogEntry(2L, 2L, "Kham tim mach - Goi 2", "CARDIO", true, null),
                        new MedicalServiceCatalogEntry(3L, 2L, "Kham tong quat", "GENERAL", true, null)
                ),
                224
        );

        when(restTemplate.exchange(
                eq("http://localhost:8082/api/services?page=0&size=20"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(MedicalServiceCatalogPageResponse.class)
        )).thenReturn(ResponseEntity.ok(page));

        var answer = service.answerServiceCatalog("Bearer token");

        assertThat(answer).isPresent();
        assertThat(answer.get()).contains("224 dich vu");
        assertThat(answer.get()).contains("Kham tim mach - Goi 2");
        assertThat(answer.get()).contains("cardio");
    }
}
