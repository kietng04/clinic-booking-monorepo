package com.clinicbooking.appointmentservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Feign Client Configuration
 *
 * Configures Feign clients to forward JWT token from incoming requests
 * to outgoing service-to-service calls.
 *
 * This solves the 403 Forbidden error when appointment-service calls user-service,
 * because user-service requires JWT authentication for protected endpoints.
 */
@Configuration
public class FeignConfig {

    /**
     * Request interceptor that forwards Authorization header to Feign clients
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Get current HTTP request
                ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();

                    // Forward Authorization header if present
                    String authHeader = request.getHeader("Authorization");
                    if (authHeader != null && !authHeader.isEmpty()) {
                        template.header("Authorization", authHeader);
                    }

                    // Also forward correlation ID for request tracing
                    String correlationId = request.getHeader("X-Correlation-Id");
                    if (correlationId != null && !correlationId.isEmpty()) {
                        template.header("X-Correlation-Id", correlationId);
                    }
                }
            }
        };
    }
}
