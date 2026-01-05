package com.clinicbooking.paymentservice.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@Getter
public class MomoConfig {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.public-key:}")
    private String publicKey;

    @Value("${momo.endpoint:https://test-payment.momo.vn}")
    private String endpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.request-type:captureWallet}")
    private String requestType;

    
    public void init() {
        log.info("Momo Configuration initialized");
        log.debug("Partner Code: {}", partnerCode);
        log.debug("Endpoint: {}", endpoint);
        log.debug("Request Type: {}", requestType);
    }

    
    public boolean isValid() {
        return partnerCode != null && !partnerCode.isEmpty() &&
               accessKey != null && !accessKey.isEmpty() &&
               secretKey != null && !secretKey.isEmpty() &&
               endpoint != null && !endpoint.isEmpty() &&
               redirectUrl != null && !redirectUrl.isEmpty() &&
               ipnUrl != null && !ipnUrl.isEmpty();
    }

    
    public String getEnvironmentType() {
        return endpoint.contains("test") ? "dev" : "prod";
    }

}
