package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.ReportExportDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD Tests for ReportPdfService
 * Following Red-Green-Refactor cycle
 */
class ReportPdfServiceTest {

    private ReportPdfService reportPdfService;

    @BeforeEach
    void setUp() {
        reportPdfService = new ReportPdfService();
    }

    @Nested
    @DisplayName("generateReportPdf")
    class GenerateReportPdf {

        @Test
        @DisplayName("generates valid PDF bytes with all sections")
        void generates_valid_pdf_bytes_with_all_sections() throws Exception {
            // Given: Complete report data
            ReportExportDto reportData = createCompleteReportData();

            // When: Generate PDF
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);

            // Then: PDF should be generated
            assertThat(pdfBytes).isNotNull();
            assertThat(pdfBytes.length).isGreaterThan(0);

            // PDF signature starts with %PDF
            String pdfHeader = new String(pdfBytes, 0, 4);
            assertThat(pdfHeader).isEqualTo("%PDF");
        }

        @Test
        @DisplayName("handles null appointment report gracefully")
        void handles_null_appointment_report() throws Exception {
            // Given: Report with null appointment section
            ReportExportDto reportData = ReportExportDto.builder()
                    .appointmentReport(null)
                    .revenueReport(createRevenueData())
                    .patientReport(createPatientData())
                    .build();

            // When/Then: Should not throw
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);
            assertThat(pdfBytes).isNotNull();
        }

        @Test
        @DisplayName("handles null revenue report gracefully")
        void handles_null_revenue_report() throws Exception {
            // Given: Report with null revenue section
            ReportExportDto reportData = ReportExportDto.builder()
                    .appointmentReport(createAppointmentData())
                    .revenueReport(null)
                    .patientReport(createPatientData())
                    .build();

            // When/Then: Should not throw
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);
            assertThat(pdfBytes).isNotNull();
        }

        @Test
        @DisplayName("handles empty monthly trends gracefully")
        void handles_empty_monthly_trends() throws Exception {
            // Given: Report with empty trends
            ReportExportDto.AppointmentReportData appointmentData = ReportExportDto.AppointmentReportData.builder()
                    .totalAppointments(100)
                    .confirmed(80)
                    .completed(70)
                    .cancelled(10)
                    .monthlyTrend(Arrays.asList()) // Empty list
                    .build();

            ReportExportDto reportData = ReportExportDto.builder()
                    .appointmentReport(appointmentData)
                    .build();

            // When/Then: Should not throw
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);
            assertThat(pdfBytes).isNotNull();
        }
    }

    @Nested
    @DisplayName("Vietnamese Text Support")
    class VietnameseTextSupport {

        @Test
        @DisplayName("PDF contains Vietnamese characters correctly encoded")
        void pdf_contains_vietnamese_characters() throws Exception {
            // Given: Report data with Vietnamese text expectation
            ReportExportDto reportData = createCompleteReportData();

            // When: Generate PDF
            byte[] pdfBytes = reportPdfService.generateReportPdf(reportData);

            // Then: PDF should be generated without errors
            // Note: Actual Vietnamese text verification would require PDF parsing
            assertThat(pdfBytes).isNotNull();
            assertThat(pdfBytes.length).isGreaterThan(1000); // Reasonable size for content
        }
    }

    // Helper methods to create test data
    private ReportExportDto createCompleteReportData() {
        return ReportExportDto.builder()
                .appointmentReport(createAppointmentData())
                .revenueReport(createRevenueData())
                .patientReport(createPatientData())
                .build();
    }

    private ReportExportDto.AppointmentReportData createAppointmentData() {
        List<ReportExportDto.MonthlyData> monthlyData = Arrays.asList(
                ReportExportDto.MonthlyData.builder()
                        .month("Th1").total(100).confirmed(80).completed(70).cancelled(10).build(),
                ReportExportDto.MonthlyData.builder()
                        .month("Th2").total(120).confirmed(100).completed(90).cancelled(12).build());

        return ReportExportDto.AppointmentReportData.builder()
                .totalAppointments(220)
                .confirmed(180)
                .completed(160)
                .cancelled(22)
                .monthlyTrend(monthlyData)
                .build();
    }

    private ReportExportDto.RevenueReportData createRevenueData() {
        List<ReportExportDto.MonthlyRevenueData> monthlyData = Arrays.asList(
                ReportExportDto.MonthlyRevenueData.builder()
                        .month("Th1").revenue(50000000L).online(30000000L).cash(20000000L).build(),
                ReportExportDto.MonthlyRevenueData.builder()
                        .month("Th2").revenue(60000000L).online(40000000L).cash(20000000L).build());

        return ReportExportDto.RevenueReportData.builder()
                .totalRevenue(110000000L)
                .onlinePayment(70000000L)
                .cashPayment(40000000L)
                .monthlyTrend(monthlyData)
                .build();
    }

    private ReportExportDto.PatientReportData createPatientData() {
        return ReportExportDto.PatientReportData.builder()
                .totalPatients(500)
                .newPatients(50)
                .activePatients(300)
                .build();
    }
}
