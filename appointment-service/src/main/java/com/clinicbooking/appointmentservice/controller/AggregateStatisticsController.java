package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AggregatedDashboardStatisticsDto;
import com.clinicbooking.appointmentservice.dto.DoctorStatisticsDto;
import com.clinicbooking.appointmentservice.dto.PatientStatisticsDto;
import com.clinicbooking.appointmentservice.service.AggregateStatisticsService;
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

@RestController
@RequestMapping("/api/statistics/aggregate")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Aggregate Statistics", description = "API quản lý thống kê tổng hợp từ nhiều dịch vụ")
@SecurityRequirement(name = "bearerAuth")
public class AggregateStatisticsController {

    private final AggregateStatisticsService aggregateStatisticsService;

    @GetMapping("/dashboard")
    @Operation(
            summary = "Get comprehensive admin dashboard statistics",
            description = "Retrieve aggregated statistics from all services (Users, Appointments, Medical). Includes system health metrics and overall analytics. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Dashboard statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AggregatedDashboardStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching statistics"
            )
    })
    public ResponseEntity<AggregatedDashboardStatisticsDto> getDashboardStatistics() {
        log.debug("Received request for aggregated dashboard statistics");
        AggregatedDashboardStatisticsDto statistics = aggregateStatisticsService.getAdminDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(
            summary = "Get patient-specific statistics",
            description = "Retrieve comprehensive statistics for a specific patient including appointment history, medical records, and calculated metrics. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Patient statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PatientStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Patient not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<PatientStatisticsDto> getPatientStatistics(@PathVariable Long patientId) {
        log.debug("Received request for patient statistics: {}", patientId);
        PatientStatisticsDto statistics = aggregateStatisticsService.getPatientStatistics(patientId);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(
            summary = "Get doctor-specific statistics",
            description = "Retrieve comprehensive statistics for a specific doctor including appointment history, patient count, completion rates, and performance metrics. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Doctor statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = DoctorStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Doctor not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<DoctorStatisticsDto> getDoctorStatistics(@PathVariable Long doctorId) {
        log.debug("Received request for doctor statistics: {}", doctorId);
        DoctorStatisticsDto statistics = aggregateStatisticsService.getDoctorStatistics(doctorId);
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/cache/clear")
    @Operation(
            summary = "Clear all statistics caches",
            description = "Manually clear all cached statistics across all services. Useful when you need fresh data immediately without waiting for cache expiration."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "All statistics caches cleared successfully"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<Void> clearAllCaches() {
        log.info("Clearing all statistics caches");
        aggregateStatisticsService.clearAllStatisticsCaches();
        return ResponseEntity.noContent().build();
    }
}
