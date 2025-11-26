package com.clinicbooking.clinic_booking_system.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to add correlation ID to MDC for tracking across logs
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MDCFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String USER_ID_KEY = "userId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Get or generate correlation ID
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }

            // Add to MDC
            MDC.put(CORRELATION_ID_KEY, correlationId);

            // Add correlation ID to response header
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            // Continue filter chain
            filterChain.doFilter(request, response);

        } finally {
            // Clean up MDC
            MDC.remove(CORRELATION_ID_KEY);
            MDC.remove(USER_ID_KEY);
        }
    }

    /**
     * Add user ID to MDC for tracking (call this after authentication)
     */
    public static void setUserId(Long userId) {
        if (userId != null) {
            MDC.put(USER_ID_KEY, userId.toString());
        }
    }
}
