package com.clinicbooking.consultationservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FeignConfig Tests")
class FeignConfigTest {

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    @DisplayName("Should forward Authorization and correlation headers when present")
    void shouldForwardAuthorizationAndCorrelationHeaders() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test-token");
        request.addHeader("X-Correlation-Id", "corr-123");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        FeignConfig config = new FeignConfig();
        RequestInterceptor interceptor = config.requestInterceptor();
        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        Collection<String> authValues = template.headers().get(HttpHeaders.AUTHORIZATION);
        Collection<String> correlationValues = template.headers().get("X-Correlation-Id");

        assertThat(authValues).containsExactly("Bearer test-token");
        assertThat(correlationValues).containsExactly("corr-123");
    }
}
