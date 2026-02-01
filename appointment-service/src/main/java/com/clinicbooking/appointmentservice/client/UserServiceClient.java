package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.PatientDemographicsDto;
import com.clinicbooking.appointmentservice.dto.SpecializationDistributionDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.dto.UserGrowthDto;
import com.clinicbooking.appointmentservice.dto.UserStatisticsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/statistics/users/summary")
    UserStatisticsDto getUserStatistics();

    @GetMapping("/api/statistics/users/growth")
    List<UserGrowthDto> getUserGrowthByMonth(@RequestParam("months") int months);

    @GetMapping("/api/statistics/users/specializations")
    List<SpecializationDistributionDto> getSpecializationDistribution();

    @GetMapping("/api/statistics/users/doctor/{doctorId}/patient-demographics")
    PatientDemographicsDto getPatientDemographics(@PathVariable("doctorId") Long doctorId);
}
