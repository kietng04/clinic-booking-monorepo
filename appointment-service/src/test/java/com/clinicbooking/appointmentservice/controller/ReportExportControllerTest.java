package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.service.AggregateStatisticsService;
import com.clinicbooking.appointmentservice.service.ReportPdfService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * TDD Tests for ReportExportController
 */
@ExtendWith(MockitoExtension.class)
class ReportExportControllerTest {

    @Mock
    private ReportPdfService reportPdfService;

    @Mock
    private AggregateStatisticsService statisticsService;

    @InjectMocks
    private ReportExportController controller;

    @Test
    @DisplayName("exportPdf returns PDF with correct headers")
    void exportPdf_returns_pdf_with_correct_headers() throws Exception {
        // Given: Mock services return valid data
        mockStatisticsService();
        byte[] mockPdf = "%PDF-1.4 mock content".getBytes();
        when(reportPdfService.generateReportPdf(any())).thenReturn(mockPdf);

        // When: Call export endpoint
        ResponseEntity<byte[]> response = controller.exportPdf();

        // Then: Response should have correct status and headers
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(response.getBody()).isEqualTo(mockPdf);
    }

    @Test
    @DisplayName("exportPdf returns 500 when service throws exception")
    void exportPdf_returns_500_when_service_throws() throws Exception {
        // Given: Service throws exception
        mockStatisticsService();
        when(reportPdfService.generateReportPdf(any())).thenThrow(new RuntimeException("PDF generation failed"));

        // When: Call export endpoint
        ResponseEntity<byte[]> response = controller.exportPdf();

        // Then: Response should be 500
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    @DisplayName("exportPdf builds report data from statistics correctly")
    void exportPdf_builds_report_data_correctly() throws Exception {
        // Given: Mock services with specific data
        mockStatisticsService();
        byte[] mockPdf = "%PDF-1.4".getBytes();
        when(reportPdfService.generateReportPdf(any())).thenReturn(mockPdf);

        // When: Call export endpoint
        controller.exportPdf();

        // Then: PDF service should be called with report data
        verify(reportPdfService).generateReportPdf(any(ReportExportDto.class));
        verify(statisticsService).getAdminDashboardStatistics();
        verify(statisticsService).getAdminAnalyticsDashboard();
    }

    @Test
    @DisplayName("exportPdf calculates revenue from BigDecimal correctly")
    void exportPdf_calculates_revenue_from_bigdecimal() throws Exception {
        // Given: Analytics with BigDecimal revenue
        AggregatedDashboardStatisticsDto dashboard = createMockDashboard();
        AdminAnalyticsDashboardDto analytics = createAnalyticsWithBigDecimalRevenue();

        when(statisticsService.getAdminDashboardStatistics()).thenReturn(dashboard);
        when(statisticsService.getAdminAnalyticsDashboard()).thenReturn(analytics);

        byte[] mockPdf = "%PDF-1.4".getBytes();
        when(reportPdfService.generateReportPdf(any())).thenReturn(mockPdf);

        // When: Call export
        ResponseEntity<byte[]> response = controller.exportPdf();

        // Then: Should succeed without BigDecimal conversion errors
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private void mockStatisticsService() {
        when(statisticsService.getAdminDashboardStatistics()).thenReturn(createMockDashboard());
        when(statisticsService.getAdminAnalyticsDashboard()).thenReturn(createMockAnalytics());
    }

    private AggregatedDashboardStatisticsDto createMockDashboard() {
        UserStatisticsDto userStats = UserStatisticsDto.builder()
                .totalPatients(500L)
                .totalDoctors(50L)
                .build();

        return AggregatedDashboardStatisticsDto.builder()
                .userStatistics(userStats)
                .build();
    }

    private AdminAnalyticsDashboardDto createMockAnalytics() {
        return AdminAnalyticsDashboardDto.builder()
                .appointmentTrends(Arrays.asList(
                        AppointmentTrendDto.builder()
                                .month("Th1").total(100).completed(80).cancelled(10).build()))
                .revenue(Arrays.asList(
                        MonthlyRevenueDto.builder()
                                .month("Th1").thisYear(new BigDecimal("50000000")).build()))
                .build();
    }

    private AdminAnalyticsDashboardDto createAnalyticsWithBigDecimalRevenue() {
        return AdminAnalyticsDashboardDto.builder()
                .appointmentTrends(Arrays.asList(
                        AppointmentTrendDto.builder()
                                .month("Th1").total(100).completed(80).cancelled(10).build()))
                .revenue(Arrays.asList(
                        MonthlyRevenueDto.builder()
                                .month("Th1").thisYear(new BigDecimal("99999999.99")).build(),
                        MonthlyRevenueDto.builder()
                                .month("Th2").thisYear(new BigDecimal("150000000.50")).build()))
                .build();
    }
}
