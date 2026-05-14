package com.clinicbooking.chatbotservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class QueryExpansionServiceTest {

    private QueryExpansionService service;

    @BeforeEach
    void setUp() {
        service = new QueryExpansionService();
        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "maxQueries", 4);
    }

    @Test
    void shouldExpandClinicHoursQuestionWithIntentAwareVariants() {
        var queries = service.expand("phong kham mo cua may gio", "CLINIC_HOURS");

        assertThat(queries).contains("phong kham mo cua may gio");
        assertThat(queries).anyMatch(query -> query.contains("gio lam viec phong kham"));
        assertThat(queries).hasSizeLessThanOrEqualTo(4);
    }

    @Test
    void shouldReturnOnlyOriginalQuestionWhenExpansionDisabled() {
        ReflectionTestUtils.setField(service, "enabled", false);

        var queries = service.expand("gia kham bao nhieu", "SERVICE_PRICE");

        assertThat(queries).containsExactly("gia kham bao nhieu");
    }
}
