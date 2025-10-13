package com.clinicbooking.medicalservice.controller;

import com.clinicbooking.medicalservice.dto.MedicalStatisticsDto;
import com.clinicbooking.medicalservice.service.MedicalStatisticsService;
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
@Tag(name = "Statistics", description = "API quản lý thống kê y tế")
@SecurityRequirement(name = "bearerAuth")
public class MedicalStatisticsController {

    private final MedicalStatisticsService medicalStatisticsService;

    @GetMapping("/medical/summary")
    @Operation(
            summary = "Get medical statistics summary",
            description = "Retrieve comprehensive medical statistics including medical records, prescriptions, medications, health metrics, and calculated averages. Results are cached for 5 minutes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Medical statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MedicalStatisticsDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error while fetching statistics"
            )
    })
    public ResponseEntity<MedicalStatisticsDto> getMedicalStatistics() {
        log.debug("Received request for medical statistics summary");
        MedicalStatisticsDto statistics = medicalStatisticsService.getMedicalStatistics();
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
        medicalStatisticsService.clearStatisticsCache();
        return ResponseEntity.noContent().build();
    }
}
