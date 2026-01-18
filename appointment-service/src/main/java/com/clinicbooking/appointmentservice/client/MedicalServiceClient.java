package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.MedicalStatisticsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "medical-service", url = "${services.medical-service.url:http://medical-service:8083}")
public interface MedicalServiceClient {

    @GetMapping("/api/statistics/medical/summary")
    MedicalStatisticsDto getMedicalStatistics();
}
