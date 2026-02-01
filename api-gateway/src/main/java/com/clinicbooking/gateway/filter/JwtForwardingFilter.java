package com.clinicbooking.gateway.filter;

import com.clinicbooking.gateway.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * GlobalFilter để forward JWT token từ client tới downstream services.
 *
 * Chức năng:
 * - Extract JWT từ Authorization header
 * - Validate JWT token (không là required, chỉ validate nếu có)
 * - Forward original Authorization header tới downstream services
 * - Thêm X-User-Id, X-User-Email, X-User-Role headers từ JWT claims
 * - Thêm X-Correlation-Id cho tracing
 * - Log request với correlation ID
 *
 * Flow:
 * 1. Client gửi request với Authorization header: "Bearer {token}"
 * 2. Filter extract JWT và validate (nếu cần)
 * 3. Extract user info từ JWT claims
 * 4. Thêm user context headers
 * 5. Forward original Authorization header tới downstream services
 * 6. Downstream services sẽ nhận được JWT và có thể validate lại nếu cần
 *
 * Lợi ích:
 * - Downstream services có full control qua JWT validation
 * - Không phải duplicate JWT logic ở gateway
 * - Hỗ trợ service-to-service auth nếu cần
 * - User context headers có sẵn cho convenience logging
 */
@Component
@Slf4j
public class JwtForwardingFilter implements GlobalFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // Generate correlation ID if not present
        String correlationId = request.getHeaders().getFirst("X-Correlation-Id");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Skip JWT validation for authentication endpoints
        if (path.startsWith("/api/auth/")) {
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Correlation-Id", correlationId)
                    .build();

            log.debug("[{}] Skipping JWT validation for auth endpoint: {}", correlationId, path);
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }

        // Skip JWT validation for actuator health endpoint
        if (path.startsWith("/actuator/health")) {
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Correlation-Id", correlationId)
                    .build();

            log.debug("[{}] Skipping JWT validation for health endpoint", correlationId);
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }

        // Nếu không có Authorization header, chỉ forward request với correlation ID
        if (authHeader == null || authHeader.isEmpty()) {
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Correlation-Id", correlationId)
                    .build();

            log.debug("[{}] Request without JWT - Gateway forwarding", correlationId);
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }

        // Validate Bearer token format
        if (!authHeader.startsWith("Bearer ")) {
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Correlation-Id", correlationId)
                    .build();

            log.warn("[{}] Invalid Authorization header format (not Bearer token)", correlationId);
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }

        String token = authHeader.substring(7);

        try {
            // Validate JWT token
            if (!jwtService.validateToken(token)) {
                log.warn("[{}] Invalid or expired JWT token", correlationId);
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-Correlation-Id", correlationId)
                        .build();
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }

            // Extract user information từ JWT claims
            String userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            // Create modified request with:
            // 1. Original Authorization header (để downstream services validate nếu cần)
            // 2. User context headers (để downstream services sử dụng without extracting JWT)
            // 3. Correlation ID (để tracing)
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId != null ? userId : "")
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-User-Role", role != null ? role : "")
                    .header("X-Correlation-Id", correlationId)
                    // Keep original Authorization header for downstream services
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .build();

            log.debug("[{}] JWT validated and forwarded - UserId: {}, Email: {}, Role: {}",
                    correlationId, userId, email, role);

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            log.error("[{}] Error processing JWT: {}", correlationId, e.getMessage());

            // Even on error, forward request with correlation ID for tracing
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Correlation-Id", correlationId)
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }
    }
}
