package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.AppointmentStatisticsDto;
import com.clinicbooking.appointmentservice.service.AppointmentStatisticsService;
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
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Statistics", description = "API quản lý thống kê cuộc hẹn")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentStatisticsController {

    private final AppointmentStatisticsService appointmentStatisticsService;

    @GetMapping("/appointments/summary")
    @Operation(
            summary = "Get appointment statistics summary",
            description = "Retrieve comprehensive appointment statistics including totals by status, time periods, types, and calculated metrics like completion/cancellation rates. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Appointment statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AppointmentStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching statistics"
            )
    })
    public ResponseEntity<AppointmentStatisticsDto> getAppointmentStatistics() {
        log.debug("Received request for appointment statistics summary");
        AppointmentStatisticsDto statistics = appointmentStatisticsService.getAppointmentStatistics();
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
        appointmentStatisticsService.clearStatisticsCache();
        return ResponseEntity.noContent().build();
    }
}
