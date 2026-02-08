package com.clinicbooking.paymentservice.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtAuthenticationFilter Tests")
class JwtAuthenticationFilterTest {

    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should authenticate when gateway forwards user id and role headers")
    void shouldAuthenticateWhenGatewayHeadersPresent() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/payments/my-payments");
        request.addHeader("X-User-Id", "100");
        request.addHeader("X-User-Role", "PATIENT");
        request.addHeader("X-User-Email", "patient@example.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().isAuthenticated()).isTrue();
    }
}
