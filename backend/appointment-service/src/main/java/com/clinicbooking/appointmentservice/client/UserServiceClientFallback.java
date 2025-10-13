package com.clinicbooking.appointmentservice.client;

import com.clinicbooking.appointmentservice.dto.PatientDemographicsDto;
import com.clinicbooking.appointmentservice.dto.SpecializationDistributionDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.dto.UserBasicInfoDto;
import com.clinicbooking.appointmentservice.dto.UserGrowthDto;
import com.clinicbooking.appointmentservice.dto.UserStatisticsDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDto getUserById(Long id) {
        log.warn("Fallback: User service is unavailable. Returning placeholder for user ID: {}", id);
        return UserDto.builder()
                .id(id)
                .email("unknown@fallback.com")
                .fullName("Unknown User")
                .phone("N/A")
                .role("UNKNOWN")
                .isActive(true)
                .build();
    }

    @Override
    public UserStatisticsDto getUserStatistics() {
        log.warn("Fallback: User service is unavailable. Returning empty user statistics");
        return UserStatisticsDto.builder()
                .totalUsers(0L)
                .totalPatients(0L)
                .totalDoctors(0L)
                .activeUsers(0L)
                .inactiveUsers(0L)
                .newUsersThisMonth(0L)
                .newPatientsThisMonth(0L)
                .newDoctorsThisMonth(0L)
                .emailVerifiedUsers(0L)
                .phoneVerifiedUsers(0L)
                .build();
    }

    @Override
    public List<UserGrowthDto> getUserGrowthByMonth(int months) {
        log.warn("Fallback: User service is unavailable. Returning empty user growth list");
        return new ArrayList<>();
    }

    @Override
    public List<SpecializationDistributionDto> getSpecializationDistribution() {
        log.warn("Fallback: User service is unavailable. Returning empty specialization distribution");
        return new ArrayList<>();
    }

    @Override
    public PatientDemographicsDto getPatientDemographics(Long doctorId) {
        log.warn("Fallback: User service is unavailable. Returning empty patient demographics for doctor ID: {}", doctorId);
        return PatientDemographicsDto.builder()
                .ageDistribution(new ArrayList<>())
                .genderRatio(new ArrayList<>())
                .build();
    }

    @Override
    public List<UserBasicInfoDto> getBasicUsersByIds(List<Long> ids) {
        log.warn("Fallback: User service is unavailable. Returning empty basic user list for ids size={}", ids == null ? 0 : ids.size());
        return new ArrayList<>();
    }
}
