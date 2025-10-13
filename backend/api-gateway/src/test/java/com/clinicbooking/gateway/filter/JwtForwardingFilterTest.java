package com.clinicbooking.gateway.filter;

import com.clinicbooking.gateway.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("JWT Forwarding Filter Tests")
class JwtForwardingFilterTest {

    private static final String JWT_SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=";

    private JwtForwardingFilter jwtForwardingFilter;
    private String validToken;

    @BeforeEach
    void setUp() throws Exception {
        JwtService jwtService = new JwtService(JWT_SECRET);
        jwtForwardingFilter = new JwtForwardingFilter();

        var field = JwtForwardingFilter.class.getDeclaredField("jwtService");
        field.setAccessible(true);
        field.set(jwtForwardingFilter, jwtService);

        validToken = createTestToken(123L, "user@example.com", "PATIENT");
    }

    @Test
    @DisplayName("Should forward request with valid JWT token")
    void shouldForwardValidToken() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                        .build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Should continue chain when authorization header is missing")
    void shouldContinueWhenAuthorizationHeaderMissing() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments").build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Should continue chain for invalid JWT token without throwing")
    void shouldContinueForInvalidToken() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.token.here")
                        .build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Should bypass JWT processing for auth endpoints")
    void shouldBypassForAuthEndpoints() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/auth/login").build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = jwtForwardingFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    private String createTestToken(Long userId, String email, String role) {
        byte[] keyBytes = Base64.getDecoder().decode(JWT_SECRET);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .claim("userId", userId)
                .claim("role", role)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }
}
