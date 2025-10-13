package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.statistics.PatientDemographicsDto;
import com.clinicbooking.userservice.dto.statistics.SpecializationDistributionDto;
import com.clinicbooking.userservice.dto.statistics.UserGrowthDto;
import com.clinicbooking.userservice.dto.statistics.UserStatisticsDto;
import com.clinicbooking.userservice.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Statistics", description = "API quản lý thống kê người dùng")
@SecurityRequirement(name = "bearerAuth")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/users/summary")
    @Operation(
            summary = "Get user statistics summary",
            description = "Retrieve comprehensive user statistics including total users, patients, doctors, and monthly metrics. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching statistics"
            )
    })
    public ResponseEntity<UserStatisticsDto> getUserStatistics() {
        log.debug("Received request for user statistics summary");
        UserStatisticsDto statistics = statisticsService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/cache/clear")
    @Operation(
            summary = "Clear statistics cache",
            description = "Manually clear the cached statistics. Useful when you need fresh data immediately without waiting for cache expiration."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Statistics cache cleared successfully"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<Void> clearStatisticsCache() {
        log.info("Clearing statistics cache");
        statisticsService.clearStatisticsCache();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/growth")
    @Operation(
            summary = "Get user growth by month",
            description = "Retrieve user growth statistics grouped by month for the specified number of months. Returns patient, doctor, and total user counts per month."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User growth statistics retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching growth statistics"
            )
    })
    public ResponseEntity<List<UserGrowthDto>> getUserGrowthByMonth(
            @RequestParam(defaultValue = "12") int months) {
        log.debug("Received request for user growth statistics for {} months", months);
        List<UserGrowthDto> growthData = statisticsService.getUserGrowthByMonth(months);
        return ResponseEntity.ok(growthData);
    }

    @GetMapping("/users/specializations")
    @Operation(
            summary = "Get specialization distribution",
            description = "Retrieve the distribution of doctors by specialization with count and percentage."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Specialization distribution retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching specialization data"
            )
    })
    public ResponseEntity<List<SpecializationDistributionDto>> getSpecializationDistribution() {
        log.debug("Received request for specialization distribution");
        List<SpecializationDistributionDto> distribution = statisticsService.getSpecializationDistribution();
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/users/doctor/{doctorId}/patient-demographics")
    @Operation(
            summary = "Get patient demographics for doctor",
            description = "Retrieve patient demographics (age distribution and gender ratio) for patients who have appointments with the specified doctor."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Patient demographics retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Doctor not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching demographics"
            )
    })
    public ResponseEntity<PatientDemographicsDto> getPatientDemographics(@PathVariable Long doctorId) {
        log.debug("Received request for patient demographics for doctor: {}", doctorId);
        PatientDemographicsDto demographics = statisticsService.getPatientDemographics(doctorId);
        return ResponseEntity.ok(demographics);
    }
}
