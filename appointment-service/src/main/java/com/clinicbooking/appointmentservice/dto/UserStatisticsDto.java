package com.clinicbooking.appointmentservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User Statistics - Aggregated from User Service")
public class UserStatisticsDto implements Serializable {
    private static final long serialVersionUID = 1L;
    @Schema(example = "250")
    private Long totalUsers;
    @Schema(example = "180")
    private Long totalPatients;
    @Schema(example = "45")
    private Long totalDoctors;
    @Schema(example = "240")
    private Long activeUsers;
    @Schema(example = "10")
    private Long inactiveUsers;
    @Schema(example = "25")
    private Long newUsersThisMonth;
    @Schema(example = "15")
    private Long newPatientsThisMonth;
    @Schema(example = "5")
    private Long newDoctorsThisMonth;
    @Schema(example = "235")
    private Long emailVerifiedUsers;
    @Schema(example = "210")
    private Long phoneVerifiedUsers;
    private LocalDateTime generatedAt;
    private Integer cacheDurationMinutes;
}
