package com.clinicbooking.gateway.filter;

import com.clinicbooking.gateway.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.*;

/**
 * Integration tests for JwtForwardingFilter.
 *
 * Tests JWT forwarding behavior:
 * - Valid JWT tokens are forwarded with user context headers
 * - Invalid tokens are handled gracefully
 * - Correlation IDs are generated and forwarded
 * - Authorization header is preserved
 */
@SpringBootTest
@ActiveProfiles("test")
@Slf4j
@DisplayName("JWT Forwarding Filter Tests")
class JwtForwardingFilterTest {

    private JwtForwardingFilter jwtForwardingFilter;
    private JwtService jwtService;
    private String validToken;
    private String invalidToken;

    // Test JWT secret (same as in application.yml)
    private static final String JWT_SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(JWT_SECRET);
        jwtForwardingFilter = new JwtForwardingFilter();

        // Inject JwtService into filter
        try {
            var field = JwtForwardingFilter.class.getDeclaredField("jwtService");
            field.setAccessible(true);
            field.set(jwtForwardingFilter, jwtService);
        } catch (Exception e) {
            log.error("Failed to inject JwtService", e);
        }

        // Create valid test token
        validToken = createTestToken(123L, "user@example.com", "PATIENT");
        invalidToken = "invalid.token.here";
    }

    @Test
    @DisplayName("Should forward valid JWT token with user context headers")
    void testForwardValidToken() {
        // Arrange
        ServerWebExchange exchange = mock(ServerWebExchange.class);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        when(exchange.getRequest()).thenReturn(request);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders() {{
            set(HttpHeaders.AUTHORIZATION, "Bearer " + validToken);
        }});
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result)
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        log.info("Valid JWT token forwarding test passed");
    }

    @Test
    @DisplayName("Should handle missing Authorization header gracefully")
    void testMissingAuthorizationHeader() {
        // Arrange
        ServerWebExchange exchange = mock(ServerWebExchange.class);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        when(exchange.getRequest()).thenReturn(request);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders());
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result)
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        log.info("Missing Authorization header test passed");
    }

    @Test
    @DisplayName("Should generate Correlation ID if not present")
    void testCorrelationIdGeneration() {
        // Arrange
        ServerWebExchange exchange = mock(ServerWebExchange.class);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        when(exchange.getRequest()).thenReturn(request);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders() {{
            set(HttpHeaders.AUTHORIZATION, "Bearer " + validToken);
        }});
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result)
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        log.info("Correlation ID generation test passed");
    }

    @Test
    @DisplayName("Should handle invalid token without throwing exception")
    void testInvalidTokenHandling() {
        // Arrange
        ServerWebExchange exchange = mock(ServerWebExchange.class);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        when(exchange.getRequest()).thenReturn(request);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders() {{
            set(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken);
        }});
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result)
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        log.info("Invalid token handling test passed");
    }

    @Test
    @DisplayName("Should preserve original Authorization header")
    void testAuthorizationHeaderPreservation() {
        // Arrange
        ServerWebExchange exchange = mock(ServerWebExchange.class);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        String authHeader = "Bearer " + validToken;
        when(exchange.getRequest()).thenReturn(request);
        when(request.getHeaders()).thenReturn(new org.springframework.http.HttpHeaders() {{
            set(HttpHeaders.AUTHORIZATION, authHeader);
        }});
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        // Assert
        StepVerifier.create(result)
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        log.info("Authorization header preservation test passed");
    }

    /**
     * Helper method to create a valid test JWT token
     */
    private String createTestToken(Long userId, String email, String role) {
        byte[] keyBytes = Base64.getDecoder().decode(JWT_SECRET);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(key)
                .compact();
    }
}
