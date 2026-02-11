package com.clinicbooking.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

/**
 * Gateway configuration untuk JWT forwarding dan CORS.
 *
 * Configures:
 * - CORS to allow Authorization header
 * - Request/Response header preservation
 * - JWT forwarding settings
 */
@Configuration
@Slf4j
public class GatewayConfig {

    /**
     * Configure CORS filter untuk allow Authorization header dan
     * JWT token forwarding dari client tới downstream services.
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Allowed origins
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
                "http://localhost:4200",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8080"
        ));

        // Allowed HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allowed request headers - explicitly include Authorization
        corsConfig.setAllowedHeaders(Collections.singletonList("*"));
        corsConfig.addAllowedHeader(HttpHeaders.AUTHORIZATION);
        corsConfig.addAllowedHeader("X-Correlation-Id");
        corsConfig.addAllowedHeader("X-User-Id");
        corsConfig.addAllowedHeader("X-User-Email");
        corsConfig.addAllowedHeader("X-User-Role");

        // Expose response headers
        corsConfig.setExposedHeaders(Arrays.asList(
                HttpHeaders.AUTHORIZATION,
                "X-Correlation-Id",
                "X-User-Id",
                "X-User-Email",
                "X-User-Role"
        ));

        // Allow credentials
        corsConfig.setAllowCredentials(true);

        // Cache preflight response
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        log.info("CORS configuration loaded - allowing Authorization header and JWT forwarding");

        return new CorsWebFilter(source);
    }
}
