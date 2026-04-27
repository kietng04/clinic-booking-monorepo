package com.clinicbooking.medicalservice.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityContextTest {

    private final SecurityContext securityContext = new SecurityContext();

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void returnsNullsWhenNoRequestIsBound() {
        assertThat(securityContext.getCurrentUserId()).isNull();
        assertThat(securityContext.getCurrentUserRole()).isNull();
        assertThat(securityContext.isAdmin()).isFalse();
        assertThat(securityContext.isDoctor()).isFalse();
        assertThat(securityContext.isPatient()).isFalse();
        assertThat(securityContext.isCurrentUser(1L)).isFalse();
    }

    @Test
    void readsUserHeadersFromCurrentRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "42");
        request.addHeader("X-User-Role", "DOCTOR");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThat(securityContext.getCurrentUserId()).isEqualTo(42L);
        assertThat(securityContext.getCurrentUserRole()).isEqualTo("DOCTOR");
        assertThat(securityContext.isDoctor()).isTrue();
        assertThat(securityContext.isAdmin()).isFalse();
        assertThat(securityContext.isPatient()).isFalse();
        assertThat(securityContext.isCurrentUser(42L)).isTrue();
        assertThat(securityContext.isCurrentUser(7L)).isFalse();
    }

    @Test
    void returnsNullForBlankOrInvalidUserId() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "abc");
        request.addHeader("X-User-Role", "PATIENT");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThat(securityContext.getCurrentUserId()).isNull();
        assertThat(securityContext.getCurrentUserRole()).isEqualTo("PATIENT");
        assertThat(securityContext.isPatient()).isTrue();
        assertThat(securityContext.isCurrentUser(1L)).isFalse();
    }
}
