package com.clinicbooking.appointmentservice.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportExportDto {
    private AppointmentReportData appointmentReport;
    private RevenueReportData revenueReport;
    private PatientReportData patientReport;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentReportData {
        private int totalAppointments;
        private int confirmed;
        private int completed;
        private int cancelled;
        private List<MonthlyData> monthlyTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueReportData {
        private long totalRevenue;
        private long onlinePayment;
        private long cashPayment;
        private List<MonthlyRevenueData> monthlyTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientReportData {
        private int totalPatients;
        private int newPatients;
        private int activePatients;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private int total;
        private int confirmed;
        private int cancelled;
        private int completed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueData {
        private String month;
        private long revenue;
        private long online;
        private long cash;
    }
}
