package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AdminAnalyticsDashboardDto;
import com.clinicbooking.appointmentservice.dto.AggregatedDashboardStatisticsDto;
import com.clinicbooking.appointmentservice.dto.DoctorAnalyticsDashboardDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

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

    @GetMapping("/analytics/admin/dashboard")
    @Operation(
            summary = "Get admin analytics dashboard",
            description = "Retrieve comprehensive analytics dashboard for admins with time-series data (12-month trends), top doctors, recent activities, and distribution metrics. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Admin analytics dashboard retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AdminAnalyticsDashboardDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied - ADMIN role required"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching analytics"
            )
    })
    public ResponseEntity<AdminAnalyticsDashboardDto> getAdminAnalyticsDashboard() {
        log.debug("Received request for admin analytics dashboard");
        AdminAnalyticsDashboardDto dashboard = aggregateStatisticsService.getAdminAnalyticsDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/analytics/doctor/{doctorId}/dashboard")
    @Operation(
            summary = "Get doctor analytics dashboard",
            description = "Retrieve comprehensive analytics dashboard for a specific doctor with time-series data (6-month trends), appointment types, time slots, and patient demographics. Results are cached for 5 minutes. Doctors can only access their own data unless they are admins."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Doctor analytics dashboard retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = DoctorAnalyticsDashboardDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied - DOCTOR or ADMIN role required"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Doctor not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching analytics"
            )
    })
    public ResponseEntity<DoctorAnalyticsDashboardDto> getDoctorAnalyticsDashboard(
            @PathVariable Long doctorId,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {
        log.debug("Received request for doctor analytics dashboard: {}", doctorId);
        validateDoctorAnalyticsAccess(doctorId, currentUserId, currentUserRole);
        DoctorAnalyticsDashboardDto dashboard = aggregateStatisticsService.getDoctorAnalyticsDashboard(doctorId);
        return ResponseEntity.ok(dashboard);
    }

    private void validateDoctorAnalyticsAccess(Long doctorId, String currentUserId, String currentUserRole) {
        String normalizedRole = normalizeRole(currentUserRole);

        if ("ADMIN".equals(normalizedRole)) {
            return;
        }

        if (!"DOCTOR".equals(normalizedRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied - DOCTOR or ADMIN role required");
        }

        if (currentUserId == null || currentUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing user identity");
        }

        Long requesterId;
        try {
            requesterId = Long.valueOf(currentUserId);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid user identity");
        }

        if (!doctorId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Doctors can only access their own analytics");
        }
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }
        return normalized;
    }
}
