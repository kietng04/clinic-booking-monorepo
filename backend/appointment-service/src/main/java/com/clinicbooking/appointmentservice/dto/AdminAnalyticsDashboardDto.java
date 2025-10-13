package com.clinicbooking.appointmentservice.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDashboardDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<MonthlyRevenueDto> revenue;
    private List<UserGrowthDto> userGrowth;
    private List<AppointmentTrendDto> appointmentTrends;
    private List<StatusDistributionDto> appointmentStatus;
    private List<SpecializationDistributionDto> specializationDistribution;
    private List<TopDoctorDto> topDoctors;
    private List<RecentActivityDto> recentActivities;
    private LocalDateTime generatedAt;
}
