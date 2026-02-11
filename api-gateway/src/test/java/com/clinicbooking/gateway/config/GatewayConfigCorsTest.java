package com.clinicbooking.gateway.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Gateway CORS Configuration Tests")
class GatewayConfigCorsTest {

    @Test
    @DisplayName("Should allow preflight request from localhost:4173")
    void shouldAllowPreflightFromFrontendDevPort4173() throws Exception {
        CorsWebFilter corsWebFilter = new GatewayConfig().corsWebFilter();
        Field configSourceField = CorsWebFilter.class.getDeclaredField("configSource");
        configSourceField.setAccessible(true);

        CorsConfigurationSource source = (CorsConfigurationSource) configSourceField.get(corsWebFilter);
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.options("/api/auth/login")
                        .header("Origin", "http://localhost:4173")
                        .header("Access-Control-Request-Method", "POST")
                        .build()
        );
        CorsConfiguration config = source.getCorsConfiguration(exchange);

        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).contains("http://localhost:4173");
    }
}
