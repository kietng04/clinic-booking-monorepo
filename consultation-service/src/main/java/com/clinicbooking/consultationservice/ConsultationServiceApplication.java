package com.clinicbooking.consultationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Consultation Service
 * Handles online consultations and real-time messaging between patients and doctors
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableCaching
@EnableScheduling
public class ConsultationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsultationServiceApplication.class, args);
    }
}
