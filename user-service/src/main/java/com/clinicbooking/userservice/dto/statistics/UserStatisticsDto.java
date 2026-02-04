package com.clinicbooking.userservice.dto.statistics;

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
@Schema(description = "User Statistics Summary")
public class UserStatisticsDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Total number of registered users", example = "250")
    private Long totalUsers;

    @Schema(description = "Total number of patients", example = "180")
    private Long totalPatients;

    @Schema(description = "Total number of doctors", example = "45")
    private Long totalDoctors;

    @Schema(description = "Number of active users", example = "240")
    private Long activeUsers;

    @Schema(description = "Number of inactive users", example = "10")
    private Long inactiveUsers;

    @Schema(description = "New users registered this month", example = "25")
    private Long newUsersThisMonth;

    @Schema(description = "New patients registered this month", example = "15")
    private Long newPatientsThisMonth;

    @Schema(description = "New doctors registered this month", example = "5")
    private Long newDoctorsThisMonth;

    @Schema(description = "Number of verified email users", example = "235")
    private Long emailVerifiedUsers;

    @Schema(description = "Number of verified phone users", example = "210")
    private Long phoneVerifiedUsers;

    @Schema(description = "Timestamp when statistics were generated", example = "2025-01-08T10:30:00")
    private LocalDateTime generatedAt;

    @Schema(description = "Cache duration in minutes", example = "5")
    private Integer cacheDurationMinutes;
}
