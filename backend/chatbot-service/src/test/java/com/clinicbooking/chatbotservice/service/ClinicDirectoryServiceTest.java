package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClinicDirectoryEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
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
class ClinicDirectoryServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ClinicDirectoryService service;

    @BeforeEach
    void setUp() {
        service = new ClinicDirectoryService(restTemplate);
        ReflectionTestUtils.setField(service, "appointmentServiceUrl", "http://localhost:8082");
        ReflectionTestUtils.setField(service, "maxResults", 3);
    }

    @Test
    void shouldFormatClinicDirectoryAnswer() {
        List<ClinicDirectoryEntry> clinics = List.of(
                new ClinicDirectoryEntry(2L, "HealthFlow Clinic 2", "12 Nguyen Trai, Quan 3, TP HCM", "07:00-20:00", true),
                new ClinicDirectoryEntry(3L, "HealthFlow Clinic 3", "13 Nguyen Trai, Quan 4, TP HCM", "07:00-20:00", true)
        );

        when(restTemplate.exchange(
                eq("http://localhost:8082/api/clinics"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class)
        )).thenReturn(ResponseEntity.ok(clinics));

        var answer = service.answerClinicDirectory("Bearer token");

        assertThat(answer).isPresent();
        assertThat(answer.get()).contains("HealthFlow Clinic 2");
        assertThat(answer.get()).contains("12 Nguyen Trai");
    }
}
