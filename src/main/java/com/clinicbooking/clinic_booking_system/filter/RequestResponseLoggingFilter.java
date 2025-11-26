package com.clinicbooking.clinic_booking_system.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.UUID;

/**
 * Filter to log all HTTP requests and responses with correlation ID
 */
@Component
@Slf4j
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final int MAX_PAYLOAD_LENGTH = 1000;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip logging for actuator and static resources
        String path = request.getRequestURI();
        if (shouldNotLog(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Generate correlation ID
        String correlationId = getOrGenerateCorrelationId(request);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        // Wrap request and response to cache content
        // Spring Boot 4.0 requires content size limit parameter
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request, 1000);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            // Log request
            logRequest(wrappedRequest, correlationId);

            // Process request
            filterChain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            long duration = System.currentTimeMillis() - startTime;

            // Log response
            logResponse(wrappedResponse, correlationId, duration);

            // Copy response body back to original response
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request, String correlationId) {
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("\n====== Incoming Request [").append(correlationId).append("] ======\n");
        logMessage.append("Method: ").append(request.getMethod()).append("\n");
        logMessage.append("URI: ").append(request.getRequestURI());

        if (request.getQueryString() != null) {
            logMessage.append("?").append(request.getQueryString());
        }
        logMessage.append("\n");

        // Log headers (exclude sensitive headers)
        logMessage.append("Headers:\n");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!isSensitiveHeader(headerName)) {
                logMessage.append("  ").append(headerName).append(": ")
                        .append(request.getHeader(headerName)).append("\n");
            }
        }

        // Log request body (if present and not file upload)
        String contentType = request.getContentType();
        if (contentType != null && !contentType.contains("multipart/form-data")) {
            byte[] content = request.getContentAsByteArray();
            if (content.length > 0) {
                String body = new String(content, StandardCharsets.UTF_8);
                logMessage.append("Body: ").append(truncate(body)).append("\n");
            }
        }

        logMessage.append("======================================");
        log.info(logMessage.toString());
    }

    private void logResponse(ContentCachingResponseWrapper response, String correlationId, long duration) {
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("\n====== Outgoing Response [").append(correlationId).append("] ======\n");
        logMessage.append("Status: ").append(response.getStatus()).append("\n");
        logMessage.append("Duration: ").append(duration).append(" ms\n");

        // Log response headers
        logMessage.append("Headers:\n");
        for (String headerName : response.getHeaderNames()) {
            logMessage.append("  ").append(headerName).append(": ")
                    .append(response.getHeader(headerName)).append("\n");
        }

        // Log response body (if present)
        byte[] content = response.getContentAsByteArray();
        if (content.length > 0) {
            String contentType = response.getContentType();
            if (contentType != null && (contentType.contains("json") || contentType.contains("xml"))) {
                String body = new String(content, StandardCharsets.UTF_8);
                logMessage.append("Body: ").append(truncate(body)).append("\n");
            } else {
                logMessage.append("Body: [Binary content, ").append(content.length).append(" bytes]\n");
            }
        }

        logMessage.append("======================================");

        // Log at different levels based on status code
        if (response.getStatus() >= 500) {
            log.error(logMessage.toString());
        } else if (response.getStatus() >= 400) {
            log.warn(logMessage.toString());
        } else {
            log.info(logMessage.toString());
        }
    }

    private String getOrGenerateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    private boolean shouldNotLog(String path) {
        return path.startsWith("/actuator") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.endsWith(".css") ||
               path.endsWith(".js") ||
               path.endsWith(".ico") ||
               path.endsWith(".png") ||
               path.endsWith(".jpg");
    }

    private boolean isSensitiveHeader(String headerName) {
        String lowerCaseHeader = headerName.toLowerCase();
        return lowerCaseHeader.contains("authorization") ||
               lowerCaseHeader.contains("password") ||
               lowerCaseHeader.contains("token") ||
               lowerCaseHeader.contains("secret") ||
               lowerCaseHeader.contains("cookie");
    }

    private String truncate(String content) {
        if (content.length() > MAX_PAYLOAD_LENGTH) {
            return content.substring(0, MAX_PAYLOAD_LENGTH) + "... [truncated]";
        }
        return content;
    }
}
