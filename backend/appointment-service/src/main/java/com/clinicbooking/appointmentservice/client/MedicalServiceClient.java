package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.MedicalStatisticsDto;
import com.clinicbooking.appointmentservice.dto.PatientMedicalSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "medical-service", url = "${services.medical-service.url:http://medical-service:8083}", fallback = MedicalServiceClientFallback.class)
public interface MedicalServiceClient {

    @GetMapping("/api/statistics/medical/summary")
    MedicalStatisticsDto getMedicalStatistics();

    @GetMapping("/api/statistics/medical/patient/{patientId}/summary")
    PatientMedicalSummaryDto getPatientMedicalSummary(@PathVariable("patientId") Long patientId);
}
