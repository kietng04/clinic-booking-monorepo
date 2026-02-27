package com.clinicbooking.appointmentservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",  // Frontend dev server
                        "http://127.0.0.1:3000", // Frontend dev server (127.0.0.1)
                        "http://localhost:4200",  // Alternative frontend port
                        "http://localhost:5173",  // Vite default port
                        "http://127.0.0.1:5173", // Vite default port (127.0.0.1)
                        "http://localhost:4173",  // Frontend QA/dev port
                        "http://127.0.0.1:4173", // Frontend QA/dev port (127.0.0.1)
                        "http://localhost:4174",  // Vite fallback port
                        "http://127.0.0.1:4174", // Vite fallback port (127.0.0.1)
                        "http://localhost:8080"   // API Gateway
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
