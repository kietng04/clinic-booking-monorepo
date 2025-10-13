package com.clinicbooking.gateway.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.test.context.ActiveProfiles;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Gateway Route Configuration Tests")
class GatewayRouteConfigTest {

    @Autowired
    private RouteDefinitionLocator routeDefinitionLocator;

    @Test
    @DisplayName("Should register payment-service route")
    void shouldRegisterPaymentServiceRoute() {
        StepVerifier.create(routeDefinitionLocator.getRouteDefinitions().collectList())
                .assertNext(routes -> assertThat(routes)
                        .anySatisfy(route -> assertThat(route.getId()).isEqualTo("payment-service")))
                .verifyComplete();
    }
}
