package com.clinicbooking.userservice.config;

import com.clinicbooking.userservice.service.AvatarStorageService;
import com.clinicbooking.userservice.service.NoopAvatarStorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AvatarStorageServiceConfig {

    @Bean
    @ConditionalOnMissingBean(AvatarStorageService.class)
    public AvatarStorageService noopAvatarStorageService() {
        return new NoopAvatarStorageService();
    }
}

