package com.clinicbooking.paymentservice.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
@Slf4j
public class HttpClientConfig {

    
    private static final int MAX_TOTAL_CONNECTIONS = 100;

    
    private static final int MAX_CONNECTIONS_PER_ROUTE = 20;

    
    private static final int CONNECTION_TIMEOUT_SECONDS = 10;

    
    private static final int READ_TIMEOUT_SECONDS = 30;

    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        log.info("Initializing RestTemplate with Apache HttpClient5 configuration");

        PoolingHttpClientConnectionManager connectionManager =
                new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(MAX_TOTAL_CONNECTIONS);
        connectionManager.setDefaultMaxPerRoute(MAX_CONNECTIONS_PER_ROUTE);

        log.debug("Connection pool configured: max_total={}, max_per_route={}",
                MAX_TOTAL_CONNECTIONS, MAX_CONNECTIONS_PER_ROUTE);

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.ofSeconds(CONNECTION_TIMEOUT_SECONDS))
                .setResponseTimeout(Timeout.ofSeconds(READ_TIMEOUT_SECONDS))
                .build();

        log.debug("Request timeouts configured: connection={}s, response={}s",
                CONNECTION_TIMEOUT_SECONDS, READ_TIMEOUT_SECONDS);

        var httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        RestTemplate restTemplate = builder
                .requestFactory(() -> requestFactory)
                .setConnectTimeout(Duration.ofSeconds(CONNECTION_TIMEOUT_SECONDS))
                .setReadTimeout(Duration.ofSeconds(READ_TIMEOUT_SECONDS))
                .build();

        log.info("RestTemplate bean successfully initialized with connection pooling and timeouts");
        return restTemplate;
    }
}
