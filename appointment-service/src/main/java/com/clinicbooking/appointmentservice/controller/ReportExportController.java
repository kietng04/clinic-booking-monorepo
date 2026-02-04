package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.ReportExportDto;
import com.clinicbooking.appointmentservice.service.ReportPdfService;
import com.clinicbooking.appointmentservice.service.AggregateStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Report Export", description = "API xuất báo cáo")
public class ReportExportController {

    private final ReportPdfService reportPdfService;
    private final AggregateStatisticsService statisticsService;

    @GetMapping("/appointments")
    public ResponseEntity<ReportExportDto.AppointmentReportData> getAppointmentReport() {
        ReportExportDto data = buildReportData();
        return ResponseEntity.ok(data.getAppointmentReport());
    }

    @GetMapping("/revenue")
    public ResponseEntity<ReportExportDto.RevenueReportData> getRevenueReport() {
        ReportExportDto data = buildReportData();
        return ResponseEntity.ok(data.getRevenueReport());
    }

    @GetMapping("/patients")
    public ResponseEntity<ReportExportDto.PatientReportData> getPatientReport() {
        ReportExportDto data = buildReportData();
        return ResponseEntity.ok(data.getPatientReport());
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export comprehensive report as PDF")
    public ResponseEntity<byte[]> exportPdf() {
        try {
            log.info("Generating PDF report");

            // Gather data from statistics service
            ReportExportDto reportData = buildReportData();

            // Generate PDF
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);

            // Build response
            String filename = "bao-cao-tong-hop-" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
            headers.setContentLength(pdfBytes.length);

            log.info("PDF report generated successfully, size: {} bytes", pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private ReportExportDto buildReportData() {
        // Get aggregated stats
        var dashboard = statisticsService.getAdminDashboardStatistics();
        var analytics = statisticsService.getAdminAnalyticsDashboard();

        // Calculate totals from appointment statistics
        int totalAppointments = 0;
        int confirmedCount = 0;
        int completedCount = 0;
        int cancelledCount = 0;

        if (analytics.getAppointmentTrends() != null) {
            for (var trend : analytics.getAppointmentTrends()) {
                totalAppointments += trend.getTotal() != null ? trend.getTotal() : 0;
                completedCount += trend.getCompleted() != null ? trend.getCompleted() : 0;
                cancelledCount += trend.getCancelled() != null ? trend.getCancelled() : 0;
            }
            confirmedCount = totalAppointments - cancelledCount;
        }

        // Calculate revenue totals
        long totalRevenue = 0L;
        if (analytics.getRevenue() != null) {
            for (var rev : analytics.getRevenue()) {
                if (rev.getThisYear() != null) {
                    totalRevenue += rev.getThisYear().longValue();
                }
            }
        }

        // Get patient count from dashboard
        int totalPatients = 0;
        if (dashboard.getUserStatistics() != null && dashboard.getUserStatistics().getTotalPatients() != null) {
            totalPatients = dashboard.getUserStatistics().getTotalPatients().intValue();
        }

        return ReportExportDto.builder()
                .appointmentReport(ReportExportDto.AppointmentReportData.builder()
                        .totalAppointments(totalAppointments)
                        .confirmed(confirmedCount)
                        .completed(completedCount)
                        .cancelled(cancelledCount)
                        .monthlyTrend(analytics.getAppointmentTrends() != null
                                ? analytics.getAppointmentTrends().stream()
                                        .map(t -> ReportExportDto.MonthlyData.builder()
                                                .month(t.getMonth())
                                                .total(t.getTotal() != null ? t.getTotal() : 0)
                                                .completed(t.getCompleted() != null ? t.getCompleted() : 0)
                                                .cancelled(t.getCancelled() != null ? t.getCancelled() : 0)
                                                .build())
                                        .collect(Collectors.toList())
                                : null)
                        .build())
                .revenueReport(ReportExportDto.RevenueReportData.builder()
                        .totalRevenue(totalRevenue)
                        .onlinePayment(0L) // TODO: Get from actual payment data
                        .cashPayment(0L) // TODO: Get from actual payment data
                        .monthlyTrend(analytics.getRevenue() != null ? analytics.getRevenue().stream()
                                .map(r -> ReportExportDto.MonthlyRevenueData.builder()
                                        .month(r.getMonth())
                                        .revenue(r.getThisYear() != null ? r.getThisYear().longValue() : 0L)
                                        .build())
                                .collect(Collectors.toList()) : null)
                        .build())
                .patientReport(ReportExportDto.PatientReportData.builder()
                        .totalPatients(totalPatients)
                        .newPatients(0) // Would need user service data
                        .activePatients(0) // Would need user service data
                        .build())
                .build();
    }
}
