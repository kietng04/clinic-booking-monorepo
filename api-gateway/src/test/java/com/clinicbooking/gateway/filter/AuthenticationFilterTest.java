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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.HttpMethod.OPTIONS;

@DisplayName("Authentication Filter Tests")
class AuthenticationFilterTest {

    private static final String JWT_SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=";

    private AuthenticationFilter authenticationFilter;
    private String validToken;

    @BeforeEach
    void setUp() throws Exception {
        JwtService jwtService = new JwtService(JWT_SECRET);
        authenticationFilter = new AuthenticationFilter();

        var field = AuthenticationFilter.class.getDeclaredField("jwtService");
        field.setAccessible(true);
        field.set(authenticationFilter, jwtService);

        validToken = createTestToken(100L, "patient@clinic.local", "PATIENT");
    }

    @Test
    @DisplayName("Should return structured 401 JSON when authorization header is missing")
    void shouldReturnStructuredUnauthorizedWhenHeaderMissing() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments").build()
        );
        GatewayFilterChain chain = e -> Mono.empty();

        Mono<Void> result = authenticationFilter.apply(new AuthenticationFilter.Config())
                .filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        assertTrue(exchange.getResponse().getStatusCode() == HttpStatus.UNAUTHORIZED);
        String body = exchange.getResponse().getBodyAsString().block();
        assertNotNull(body);
        assertTrue(body.contains("\"status\":401"));
        assertTrue(body.contains("\"message\":\"Missing authorization header\""));
        assertTrue(body.contains("\"errorCode\":\"UNAUTHORIZED\""));
        assertTrue(body.contains("\"correlationId\""));
        assertTrue(body.contains("\"path\":\"/api/appointments\""));
    }

    @Test
    @DisplayName("Should continue filter chain for valid bearer token")
    void shouldContinueChainForValidToken() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                        .header("X-Correlation-Id", "corr-auth-valid-123")
                        .build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = authenticationFilter.apply(new AuthenticationFilter.Config())
                .filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Should bypass authentication for OPTIONS preflight requests")
    void shouldBypassAuthenticationForOptionsRequests() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.method(OPTIONS, "/api/auth/login")
                        .header("Origin", "http://localhost:4173")
                        .header("Access-Control-Request-Method", "POST")
                        .build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = authenticationFilter.apply(new AuthenticationFilter.Config())
                .filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        assertTrue(chainCalled.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Should return structured 401 JSON for invalid bearer format")
    void shouldReturnStructuredUnauthorizedForInvalidFormat() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Token " + validToken)
                        .build()
        );
        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = e -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        Mono<Void> result = authenticationFilter.apply(new AuthenticationFilter.Config())
                .filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        assertFalse(chainCalled.get());
        assertTrue(exchange.getResponse().getStatusCode() == HttpStatus.UNAUTHORIZED);
        String body = exchange.getResponse().getBodyAsString().block();
        assertNotNull(body);
        assertTrue(body.contains("\"message\":\"Invalid authorization header format\""));
        assertTrue(body.contains("\"errorCode\":\"UNAUTHORIZED\""));
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
