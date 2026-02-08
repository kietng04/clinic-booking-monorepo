package com.clinicbooking.consultationservice.config;

import feign.RequestInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.List;

@Configuration
@Slf4j
public class FeignConfig {

    private static final List<String> FORWARDED_HEADERS = Arrays.asList(
            HttpHeaders.AUTHORIZATION,
            "X-Correlation-Id"
    );

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
            if (!(requestAttributes instanceof ServletRequestAttributes servletAttributes)) {
                return;
            }

            FORWARDED_HEADERS.forEach(headerName -> {
                String headerValue = servletAttributes.getRequest().getHeader(headerName);
                if (headerValue != null && !headerValue.isBlank()) {
                    template.header(headerName, headerValue);
                }
            });
        };
    }
}
