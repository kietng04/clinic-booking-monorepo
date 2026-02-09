package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.MedicalServiceClient;
import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.*;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AggregateStatisticsServiceImpl implements AggregateStatisticsService {

        private final AppointmentRepository appointmentRepository;
        private final UserServiceClient userServiceClient;
        private final MedicalServiceClient medicalServiceClient;

        private static final int CACHE_DURATION_MINUTES = 5;

        @Override
        @Cacheable(value = "dashboardStatistics", unless = "#result == null")
        public AggregatedDashboardStatisticsDto getAdminDashboardStatistics() {
                log.info("Fetching aggregated dashboard statistics");

                try {
                        // Get statistics from each service
                        UserStatisticsDto userStats = userServiceClient.getUserStatistics();
                        AppointmentStatisticsDto appointmentStats = getAppointmentStatistics();
                        MedicalStatisticsDto medicalStats = medicalServiceClient.getMedicalStatistics();

                        // Calculate system health metrics
                        AggregatedDashboardStatisticsDto.SystemHealthDto systemHealth = calculateSystemHealth(
                                        userStats, appointmentStats, medicalStats);

                        return AggregatedDashboardStatisticsDto.builder()
                                        .userStatistics(userStats)
                                        .appointmentStatistics(appointmentStats)
                                        .medicalStatistics(medicalStats)
                                        .systemHealth(systemHealth)
                                        .generatedAt(LocalDateTime.now())
                                        .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                        .build();

                } catch (Exception e) {
                        log.error("Error fetching aggregated dashboard statistics: {}", e.getMessage());
                        throw new RuntimeException("Failed to fetch dashboard statistics", e);
                }
        }

        @Override
        @Cacheable(value = "patientStatistics", key = "#patientId", unless = "#result == null")
        public PatientStatisticsDto getPatientStatistics(Long patientId) {
                log.info("Fetching patient statistics for patient: {}", patientId);

                try {
                        List<Appointment> patientAppointments = appointmentRepository
                                        .findByPatientId(patientId,
                                                        org.springframework.data.domain.PageRequest.of(0,
                                                                        Integer.MAX_VALUE))
                                        .getContent();

                        if (patientAppointments.isEmpty()) {
                                log.warn("No appointments found for patient: {}", patientId);
                                return PatientStatisticsDto.builder()
                                                .patientId(patientId)
                                                .totalAppointments(0L)
                                                .completedAppointments(0L)
                                                .upcomingAppointments(0L)
                                                .cancelledAppointments(0L)
                                                .totalMedicalRecords(0L)
                                                .totalPrescriptions(0L)
                                                .completionRate(0.0)
                                                .avgAppointmentsPerMonth(0.0)
                                                .generatedAt(LocalDateTime.now())
                                                .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                                .build();
                        }

                        long totalAppointments = patientAppointments.size();
                        long completedAppointments = patientAppointments.stream()
                                        .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                                        .count();
                        long upcomingAppointments = patientAppointments.stream()
                                        .filter(a -> a.getAppointmentDate().isAfter(LocalDate.now()) &&
                                                        (a.getStatus() == Appointment.AppointmentStatus.PENDING ||
                                                                        a.getStatus() == Appointment.AppointmentStatus.CONFIRMED))
                                        .count();
                        long cancelledAppointments = patientAppointments.stream()
                                        .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED)
                                        .count();

                        // Get most frequent doctor
                        Long frequentDoctorId = patientAppointments.stream()
                                        .map(Appointment::getDoctorId)
                                        .distinct()
                                        .findFirst()
                                        .orElse(null);

                        // Get last appointment date
                        String lastAppointmentDate = patientAppointments.stream()
                                        .map(a -> a.getAppointmentDate().toString())
                                        .findFirst()
                                        .orElse(null);

                        // Calculate metrics
                        double completionRate = totalAppointments > 0
                                        ? (completedAppointments * 100.0) / totalAppointments
                                        : 0.0;

                        // Estimate months with appointments
                        long monthsWithAppointments = patientAppointments.stream()
                                        .map(a -> YearMonth.from(a.getAppointmentDate()))
                                        .distinct()
                                        .count();
                        monthsWithAppointments = Math.max(monthsWithAppointments, 1);
                        double avgAppointmentsPerMonth = (totalAppointments * 1.0) / monthsWithAppointments;

                        return PatientStatisticsDto.builder()
                                        .patientId(patientId)
                                        .totalAppointments(totalAppointments)
                                        .completedAppointments(completedAppointments)
                                        .upcomingAppointments(upcomingAppointments)
                                        .cancelledAppointments(cancelledAppointments)
                                        .frequentDoctorId(frequentDoctorId)
                                        .lastAppointmentDate(lastAppointmentDate)
                                        .completionRate(Math.round(completionRate * 100.0) / 100.0)
                                        .avgAppointmentsPerMonth(Math.round(avgAppointmentsPerMonth * 100.0) / 100.0)
                                        .generatedAt(LocalDateTime.now())
                                        .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                        .build();

                } catch (Exception e) {
                        log.error("Error fetching patient statistics for patientId: {}, error: {}", patientId, e.getMessage());
                        throw new RuntimeException("Failed to fetch patient statistics", e);
                }
        }

        @Override
        @Cacheable(value = "doctorStatistics", key = "#doctorId", unless = "#result == null")
        public DoctorStatisticsDto getDoctorStatistics(Long doctorId) {
                log.info("Fetching doctor statistics for doctor: {}", doctorId);

                try {
                        List<Appointment> doctorAppointments = appointmentRepository
                                        .findByDoctorId(doctorId,
                                                        org.springframework.data.domain.PageRequest.of(0,
                                                                        Integer.MAX_VALUE))
                                        .getContent();

                        if (doctorAppointments.isEmpty()) {
                                log.warn("No appointments found for doctor: {}", doctorId);
                                return DoctorStatisticsDto.builder()
                                                .doctorId(doctorId)
                                                .totalAppointments(0L)
                                                .completedAppointments(0L)
                                                .pendingAppointments(0L)
                                                .cancelledAppointments(0L)
                                                .uniquePatients(0L)
                                                .completionRate(0.0)
                                                .avgAppointmentsPerWeek(0.0)
                                                .generatedAt(LocalDateTime.now())
                                                .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                                .build();
                        }

                        long totalAppointments = doctorAppointments.size();
                        long completedAppointments = doctorAppointments.stream()
                                        .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                                        .count();
                        long pendingAppointments = doctorAppointments.stream()
                                        .filter(a -> a.getStatus() == Appointment.AppointmentStatus.PENDING)
                                        .count();
                        long cancelledAppointments = doctorAppointments.stream()
                                        .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED)
                                        .count();
                        long uniquePatients = doctorAppointments.stream()
                                        .map(Appointment::getPatientId)
                                        .distinct()
                                        .count();

                        // Get last appointment date
                        String lastAppointmentDate = doctorAppointments.stream()
                                        .map(a -> a.getAppointmentDate().toString())
                                        .findFirst()
                                        .orElse(null);

                        // Appointments this month
                        LocalDate today = LocalDate.now();
                        LocalDate monthStart = today.withDayOfMonth(1);
                        long appointmentsThisMonth = doctorAppointments.stream()
                                        .filter(a -> !a.getAppointmentDate().isBefore(monthStart))
                                        .count();

                        // Calculate metrics
                        double completionRate = totalAppointments > 0
                                        ? (completedAppointments * 100.0) / totalAppointments
                                        : 0.0;
                        double avgAppointmentsPerWeek = (totalAppointments * 1.0) / 52; // Rough estimate

                        return DoctorStatisticsDto.builder()
                                        .doctorId(doctorId)
                                        .totalAppointments(totalAppointments)
                                        .completedAppointments(completedAppointments)
                                        .pendingAppointments(pendingAppointments)
                                        .cancelledAppointments(cancelledAppointments)
                                        .uniquePatients(uniquePatients)
                                        .completionRate(Math.round(completionRate * 100.0) / 100.0)
                                        .avgAppointmentsPerWeek(Math.round(avgAppointmentsPerWeek * 100.0) / 100.0)
                                        .lastAppointmentDate(lastAppointmentDate)
                                        .appointmentsThisMonth(appointmentsThisMonth)
                                        .generatedAt(LocalDateTime.now())
                                        .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                        .build();

                } catch (Exception e) {
                        log.error("Error fetching doctor statistics for doctorId: {}, error: {}", doctorId, e.getMessage());
                        throw new RuntimeException("Failed to fetch doctor statistics", e);
                }
        }

        @Override
        @CacheEvict(value = { "dashboardStatistics", "patientStatistics", "doctorStatistics", "adminAnalyticsDashboard",
                        "doctorAnalyticsDashboard" }, allEntries = true)
        public void clearAllStatisticsCaches() {
                log.info("Cleared all statistics caches");
        }

        @Override
        @Cacheable(value = "adminAnalyticsDashboard", unless = "#result == null")
        public AdminAnalyticsDashboardDto getAdminAnalyticsDashboard() {
                log.info("Fetching admin analytics dashboard");

                try {
                        // 1. Get monthly revenue (last 12 months)
                        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(12);
                        List<MonthlyRevenueDto> revenue = buildMonthlyRevenue(
                                        appointmentRepository.getMonthlyRevenue(twelveMonthsAgo));

                        // 2. Get user growth from UserService via Feign
                        List<UserGrowthDto> userGrowth = userServiceClient.getUserGrowthByMonth(12);

                        // 3. Get appointment trends
                        List<AppointmentTrendDto> appointmentTrends = buildAppointmentTrends(
                                        appointmentRepository.getAppointmentTrendsByMonth(twelveMonthsAgo));

                        // 4. Get status distribution
                        List<StatusDistributionDto> appointmentStatus = buildStatusDistribution(
                                        appointmentRepository.getStatusDistribution());

                        // 5. Get specialization distribution from UserService
                        List<SpecializationDistributionDto> specializationDistribution = userServiceClient
                                        .getSpecializationDistribution();

                        // 6. Get top doctors
                        List<TopDoctorDto> topDoctors = buildTopDoctors(
                                        appointmentRepository.getTopDoctorStats(PageRequest.of(0, 10)));

                        // 7. Get recent activities
                        List<RecentActivityDto> recentActivities = buildRecentActivities();

                        return AdminAnalyticsDashboardDto.builder()
                                        .revenue(revenue)
                                        .userGrowth(userGrowth)
                                        .appointmentTrends(appointmentTrends)
                                        .appointmentStatus(appointmentStatus)
                                        .specializationDistribution(specializationDistribution)
                                        .topDoctors(topDoctors)
                                        .recentActivities(recentActivities)
                                        .generatedAt(LocalDateTime.now())
                                        .build();

                } catch (Exception e) {
                        log.error("Error fetching admin analytics dashboard: {}", e.getMessage());
                        throw new RuntimeException("Failed to fetch admin analytics dashboard", e);
                }
        }

        @Override
        @Cacheable(value = "doctorAnalyticsDashboard", key = "#doctorId", unless = "#result == null")
        public DoctorAnalyticsDashboardDto getDoctorAnalyticsDashboard(Long doctorId) {
                log.info("Fetching doctor analytics dashboard for doctor: {}", doctorId);

                try {
                        // 1. Get appointments by month (last 6 months)
                        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
                        List<Map<String, Object>> trendsData = appointmentRepository
                                        .getAppointmentTrendsByMonth(sixMonthsAgo);

                        // Filter for this doctor and build monthly appointments
                        List<MonthlyAppointmentDto> appointments = buildMonthlyAppointmentsForDoctor(doctorId,
                                        sixMonthsAgo);

                        // 2. Get appointment type breakdown
                        List<AppointmentTypeBreakdownDto> appointmentTypes = buildAppointmentTypeBreakdown(
                                        appointmentRepository.getAppointmentTypeBreakdown(doctorId));

                        // 3. Get popular time slots
                        List<TimeSlotStatsDto> timeSlots = buildTimeSlotStats(
                                        appointmentRepository.getTimeSlotStats(doctorId));

                        // 4. Build patient demographics from appointment data + user-service basic profile data
                        PatientDemographicsDto patientDemographics = buildPatientDemographicsForDoctor(doctorId);

                        return DoctorAnalyticsDashboardDto.builder()
                                        .appointments(appointments)
                                        .appointmentTypes(appointmentTypes)
                                        .timeSlots(timeSlots)
                                        .patientDemographics(patientDemographics)
                                        .generatedAt(LocalDateTime.now())
                                        .build();

                } catch (Exception e) {
                        log.error("Error fetching doctor analytics dashboard for doctorId: {}, error: {}", doctorId, e.getMessage());
                        throw new RuntimeException("Failed to fetch doctor analytics dashboard", e);
                }
        }

        private PatientDemographicsDto buildPatientDemographicsForDoctor(Long doctorId) {
                List<Long> patientIds = appointmentRepository.getDistinctPatientIdsForDoctor(doctorId);
                if (patientIds == null || patientIds.isEmpty()) {
                        return emptyPatientDemographics();
                }

                // De-duplicate while preserving order to keep payload stable.
                Set<Long> uniquePatientIds = new LinkedHashSet<>(patientIds);

                // Fetch basic user info in small batches (keeps payload size and memory bounded).
                final int batchSize = 200;
                List<UserBasicInfoDto> users = new ArrayList<>();
                List<Long> uniqueList = new ArrayList<>(uniquePatientIds);
                for (int i = 0; i < uniqueList.size(); i += batchSize) {
                        List<Long> batch = uniqueList.subList(i, Math.min(i + batchSize, uniqueList.size()));
                        List<UserBasicInfoDto> batchUsers = userServiceClient.getBasicUsersByIds(batch);
                        if (batchUsers != null) users.addAll(batchUsers);
                }

                // Stable bucket order for the UI.
                Map<String, Integer> ageBuckets = new LinkedHashMap<>();
                ageBuckets.put("0-17", 0);
                ageBuckets.put("18-30", 0);
                ageBuckets.put("31-50", 0);
                ageBuckets.put("51-70", 0);
                ageBuckets.put("70+", 0);

                Map<String, Integer> genderCounts = new LinkedHashMap<>();
                genderCounts.put("Nam", 0);
                genderCounts.put("Nữ", 0);
                genderCounts.put("Khác", 0);

                LocalDate now = LocalDate.now();
                for (UserBasicInfoDto u : users) {
                        if (u == null) continue;

                        if (u.getDateOfBirth() != null) {
                                int age = Period.between(u.getDateOfBirth(), now).getYears();
                                String bucket = age < 18 ? "0-17"
                                                : age <= 30 ? "18-30"
                                                : age <= 50 ? "31-50"
                                                : age <= 70 ? "51-70"
                                                : "70+";
                                ageBuckets.put(bucket, ageBuckets.getOrDefault(bucket, 0) + 1);
                        }

                        // The UI expects Vietnamese labels for gender ratio items.
                        String g = u.getGender();
                        String label = "Khác";
                        if ("MALE".equalsIgnoreCase(g)) label = "Nam";
                        else if ("FEMALE".equalsIgnoreCase(g)) label = "Nữ";
                        genderCounts.put(label, genderCounts.getOrDefault(label, 0) + 1);
                }

                List<PatientDemographicsDto.AgeDistributionItem> ageDistribution = ageBuckets.entrySet().stream()
                                .map(e -> PatientDemographicsDto.AgeDistributionItem.builder()
                                                .range(e.getKey())
                                                .count(e.getValue())
                                                .build())
                                .collect(Collectors.toList());

                int genderTotal = genderCounts.values().stream()
                                .filter(Objects::nonNull)
                                .mapToInt(Integer::intValue)
                                .sum();

                List<PatientDemographicsDto.GenderRatioItem> genderRatio = genderCounts.entrySet().stream()
                                .map(e -> {
                                        int count = e.getValue() == null ? 0 : e.getValue();
                                        int percentage = genderTotal > 0 ? (int) Math.round((count * 100.0) / genderTotal) : 0;
                                        return PatientDemographicsDto.GenderRatioItem.builder()
                                                        .gender(e.getKey())
                                                        .count(count)
                                                        .percentage(percentage)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return PatientDemographicsDto.builder()
                                .ageDistribution(ageDistribution)
                                .genderRatio(genderRatio)
                                .build();
        }

        private PatientDemographicsDto emptyPatientDemographics() {
                Map<String, Integer> ageBuckets = new LinkedHashMap<>();
                ageBuckets.put("0-17", 0);
                ageBuckets.put("18-30", 0);
                ageBuckets.put("31-50", 0);
                ageBuckets.put("51-70", 0);
                ageBuckets.put("70+", 0);

                List<PatientDemographicsDto.AgeDistributionItem> ageDistribution = ageBuckets.entrySet().stream()
                                .map(e -> PatientDemographicsDto.AgeDistributionItem.builder()
                                                .range(e.getKey())
                                                .count(e.getValue())
                                                .build())
                                .collect(Collectors.toList());

                List<PatientDemographicsDto.GenderRatioItem> genderRatio = List.of(
                                PatientDemographicsDto.GenderRatioItem.builder().gender("Nam").count(0).percentage(0).build(),
                                PatientDemographicsDto.GenderRatioItem.builder().gender("Nữ").count(0).percentage(0).build(),
                                PatientDemographicsDto.GenderRatioItem.builder().gender("Khác").count(0).percentage(0).build()
                );

                return PatientDemographicsDto.builder()
                                .ageDistribution(ageDistribution)
                                .genderRatio(genderRatio)
                                .build();
        }

        /**
         * Get appointment statistics (local - no Feign call)
         */
        private AppointmentStatisticsDto getAppointmentStatistics() {
                long totalAppointments = appointmentRepository.count();
                long pendingAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING);
                long confirmedAppointments = appointmentRepository
                                .countByStatus(Appointment.AppointmentStatus.CONFIRMED);
                long completedAppointments = appointmentRepository
                                .countByStatus(Appointment.AppointmentStatus.COMPLETED);
                long cancelledAppointments = appointmentRepository
                                .countByStatus(Appointment.AppointmentStatus.CANCELLED);

                long appointmentsToday = appointmentRepository.countAppointmentsToday();
                long appointmentsThisMonth = appointmentRepository.countAppointmentsThisMonth();

                double completionRate = totalAppointments > 0 ? (completedAppointments * 100.0) / totalAppointments
                                : 0.0;

                return AppointmentStatisticsDto.builder()
                                .totalAppointments(totalAppointments)
                                .pendingAppointments(pendingAppointments)
                                .confirmedAppointments(confirmedAppointments)
                                .completedAppointments(completedAppointments)
                                .cancelledAppointments(cancelledAppointments)
                                .appointmentsToday(appointmentsToday)
                                .appointmentsThisMonth(appointmentsThisMonth)
                                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                                .avgAppointmentsPerDay(Math.round((appointmentsThisMonth * 1.0
                                                / Math.max(1, java.time.LocalDate.now().getDayOfMonth())) * 100.0)
                                                / 100.0)
                                .generatedAt(LocalDateTime.now())
                                .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                                .build();
        }

        /**
         * Calculate system health metrics
         */
        private AggregatedDashboardStatisticsDto.SystemHealthDto calculateSystemHealth(
                        UserStatisticsDto userStats,
                        AppointmentStatisticsDto appointmentStats,
                        MedicalStatisticsDto medicalStats) {

                long totalActiveUsers = userStats.getActiveUsers();
                double appointmentCompletionRate = appointmentStats.getCompletionRate();
                double avgDailyAppointments = appointmentStats.getAvgAppointmentsPerDay();

                // Calculate utilization rate (active doctors / total doctors * 100)
                double utilizationRate = userStats.getTotalDoctors() > 0
                                ? (appointmentStats.getTotalAppointments() / (userStats.getTotalDoctors() * 20.0)) * 100
                                : 0.0;
                utilizationRate = Math.min(utilizationRate, 100.0); // Cap at 100%

                // Calculate doctor to patient ratio
                double doctorPatientRatio = userStats.getTotalDoctors() > 0
                                ? (userStats.getTotalPatients() * 1.0) / userStats.getTotalDoctors()
                                : 0.0;

                // Count pending actions
                long pendingActionsCount = appointmentStats.getPendingAppointments() +
                                (userStats.getInactiveUsers() > 0 ? 1 : 0) +
                                (appointmentStats.getCancelledAppointments() > 10 ? 1 : 0);

                return AggregatedDashboardStatisticsDto.SystemHealthDto.builder()
                                .totalActiveUsers(totalActiveUsers)
                                .completionRate(appointmentCompletionRate)
                                .avgDailyAppointments(Math.round(avgDailyAppointments * 100.0) / 100.0)
                                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                                .doctorPatientRatio(Math.round(doctorPatientRatio * 100.0) / 100.0)
                                .pendingActionsCount(pendingActionsCount)
                                .build();
        }

        // Helper methods for analytics dashboard

        private List<MonthlyRevenueDto> buildMonthlyRevenue(List<Map<String, Object>> queryResults) {
                Map<String, BigDecimal> revenueMap = new HashMap<>();
                for (Map<String, Object> row : queryResults) {
                        String month = (String) row.get("month");
                        BigDecimal revenue = toBigDecimal(row.get("revenue"));
                        revenueMap.put(month, revenue);
                }

                // Generate 12 months with formatted names
                List<MonthlyRevenueDto> result = new ArrayList<>();
                LocalDate now = LocalDate.now();
                for (int i = 11; i >= 0; i--) {
                        LocalDate date = now.minusMonths(i);
                        String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        String monthName = "Tháng " + date.getMonthValue();

                        BigDecimal thisYearRevenue = revenueMap.getOrDefault(monthKey, BigDecimal.ZERO);
                        // For last year comparison, check same month last year
                        LocalDate lastYearDate = date.minusYears(1);
                        String lastYearKey = lastYearDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        BigDecimal lastYearRevenue = revenueMap.getOrDefault(lastYearKey, BigDecimal.ZERO);

                        result.add(MonthlyRevenueDto.builder()
                                        .month(monthName)
                                        .thisYear(thisYearRevenue != null ? thisYearRevenue : BigDecimal.ZERO)
                                        .lastYear(lastYearRevenue != null ? lastYearRevenue : BigDecimal.ZERO)
                                        .build());
                }
                return result;
        }

        private List<AppointmentTrendDto> buildAppointmentTrends(List<Map<String, Object>> queryResults) {
                Map<String, AppointmentTrendDto> trendsMap = new HashMap<>();
                for (Map<String, Object> row : queryResults) {
                        String month = (String) row.get("month");
                        Integer total = toInteger(row.get("total"));
                        Integer completed = toInteger(row.get("completed"));
                        Integer cancelled = toInteger(row.get("cancelled"));

                        trendsMap.put(month, AppointmentTrendDto.builder()
                                        .month(month)
                                        .total(total)
                                        .completed(completed)
                                        .cancelled(cancelled)
                                        .build());
                }

                // Generate 12 months
                List<AppointmentTrendDto> result = new ArrayList<>();
                LocalDate now = LocalDate.now();
                for (int i = 11; i >= 0; i--) {
                        LocalDate date = now.minusMonths(i);
                        String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        String monthName = "Tháng " + date.getMonthValue();

                        AppointmentTrendDto trend = trendsMap.getOrDefault(monthKey,
                                        AppointmentTrendDto.builder()
                                                        .month(monthName)
                                                        .total(0)
                                                        .completed(0)
                                                        .cancelled(0)
                                                        .build());
                        trend.setMonth(monthName); // Update to localized name
                        result.add(trend);
                }
                return result;
        }

        private List<StatusDistributionDto> buildStatusDistribution(List<Map<String, Object>> queryResults) {
                Map<String, String> statusColors = Map.of(
                                "PENDING", "#FFA500",
                                "CONFIRMED", "#4169E1",
                                "COMPLETED", "#32CD32",
                                "CANCELLED", "#DC143C");

                Map<String, String> statusNames = Map.of(
                                "PENDING", "Chờ xác nhận",
                                "CONFIRMED", "Đã xác nhận",
                                "COMPLETED", "Hoàn thành",
                                "CANCELLED", "Đã hủy");

                List<StatusDistributionDto> result = new ArrayList<>();
                for (Map<String, Object> row : queryResults) {
                        String status = row.get("status").toString();
                        Integer count = toInteger(row.get("count"));

                        result.add(StatusDistributionDto.builder()
                                        .name(statusNames.getOrDefault(status, status))
                                        .value(count)
                                        .color(statusColors.getOrDefault(status, "#808080"))
                                        .build());
                }
                return result;
        }

        private List<TopDoctorDto> buildTopDoctors(List<Map<String, Object>> queryResults) {
                List<TopDoctorDto> result = new ArrayList<>();
                for (Map<String, Object> row : queryResults) {
                        Long doctorId = toLong(row.get("doctorId"));
                        String doctorName = (String) row.get("doctorName");
                        Integer totalAppointments = toInteger(row.get("totalAppointments"));
                        BigDecimal totalRevenue = toBigDecimal(row.get("totalRevenue"));
                        Integer completedCount = toInteger(row.get("completedCount"));
                        Integer totalCount = toInteger(row.get("totalCount"));
                        if (totalCount == 0)
                                totalCount = 1;

                        // Calculate completion rate
                        Integer completionRate = (completedCount * 100) / totalCount;

                        // Try to get doctor details from user service for specialization
                        String specialization = "N/A";
                        try {
                                UserDto doctor = userServiceClient.getUserById(doctorId);
                                if (doctor != null && doctor.getSpecialization() != null) {
                                        specialization = doctor.getSpecialization();
                                }
                        } catch (Exception e) {
                                log.warn("Could not fetch doctor details for ID: {}", doctorId);
                        }

                        result.add(TopDoctorDto.builder()
                                        .id(doctorId)
                                        .name(doctorName)
                                        .specialization(specialization)
                                        .appointments(totalAppointments)
                                        .revenue(totalRevenue)
                                        .rating(4.5) // TODO: Implement actual rating system
                                        .completionRate(completionRate)
                                        .build());
                }
                return result;
        }

        private BigDecimal toBigDecimal(Object value) {
                if (value == null)
                        return BigDecimal.ZERO;
                if (value instanceof BigDecimal)
                        return (BigDecimal) value;
                if (value instanceof Number)
                        return new BigDecimal(value.toString());
                return BigDecimal.ZERO;
        }

        private Integer toInteger(Object value) {
                if (value == null)
                        return 0;
                if (value instanceof Number)
                        return ((Number) value).intValue();
                return 0;
        }

        private Long toLong(Object value) {
                if (value == null)
                        return 0L;
                if (value instanceof Number)
                        return ((Number) value).longValue();
                return 0L;
        }

        private List<RecentActivityDto> buildRecentActivities() {
                List<RecentActivityDto> activities = new ArrayList<>();

                // Get recent appointments
                List<Appointment> recentAppointments = appointmentRepository
                                .getRecentAppointments(PageRequest.of(0, 10));
                for (Appointment appointment : recentAppointments) {
                        String message = String.format("Lịch hẹn mới từ bệnh nhân %s với bác sĩ %s",
                                        appointment.getPatientName(), appointment.getDoctorName());

                        activities.add(RecentActivityDto.builder()
                                        .id(appointment.getId())
                                        .type(RecentActivityDto.ActivityType.APPOINTMENT)
                                        .message(message)
                                        .timestamp(appointment.getCreatedAt())
                                        .build());
                }

                // Sort by timestamp descending
                activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

                return activities.stream().limit(10).collect(Collectors.toList());
        }

        private List<MonthlyAppointmentDto> buildMonthlyAppointmentsForDoctor(Long doctorId, LocalDate startDate) {
                // Get all appointments for this doctor
                List<Appointment> doctorAppointments = appointmentRepository
                                .findByDoctorId(doctorId, PageRequest.of(0, Integer.MAX_VALUE))
                                .getContent()
                                .stream()
                                .filter(a -> !a.getAppointmentDate().isBefore(startDate))
                                .collect(Collectors.toList());

                // Group by month
                Map<String, MonthlyAppointmentDto> monthlyData = new HashMap<>();
                for (Appointment appointment : doctorAppointments) {
                        String monthKey = appointment.getAppointmentDate()
                                        .format(DateTimeFormatter.ofPattern("yyyy-MM"));

                        MonthlyAppointmentDto existing = monthlyData.getOrDefault(monthKey,
                                        MonthlyAppointmentDto.builder()
                                                        .month(monthKey)
                                                        .count(0)
                                                        .revenue(BigDecimal.ZERO)
                                                        .completed(0)
                                                        .build());

                        existing.setCount(existing.getCount() + 1);
                        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
                                existing.setCompleted(existing.getCompleted() + 1);
                                BigDecimal serviceFee = appointment.getServiceFee() != null
                                                ? appointment.getServiceFee()
                                                : BigDecimal.ZERO;
                                existing.setRevenue(existing.getRevenue().add(serviceFee));
                        }

                        monthlyData.put(monthKey, existing);
                }

                // Generate 6 months
                List<MonthlyAppointmentDto> result = new ArrayList<>();
                LocalDate now = LocalDate.now();
                for (int i = 5; i >= 0; i--) {
                        LocalDate date = now.minusMonths(i);
                        String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        String monthName = "Tháng " + date.getMonthValue();

                        MonthlyAppointmentDto data = monthlyData.getOrDefault(monthKey,
                                        MonthlyAppointmentDto.builder()
                                                        .month(monthName)
                                                        .count(0)
                                                        .revenue(BigDecimal.ZERO)
                                                        .completed(0)
                                                        .build());
                        data.setMonth(monthName);
                        result.add(data);
                }
                return result;
        }

        private List<AppointmentTypeBreakdownDto> buildAppointmentTypeBreakdown(
                        List<Map<String, Object>> queryResults) {
                Map<String, String> typeNames = Map.of(
                                "CONSULTATION", "Tư vấn",
                                "CHECKUP", "Khám sức khỏe",
                                "FOLLOWUP", "Tái khám",
                                "EMERGENCY", "Cấp cứu");

                List<AppointmentTypeBreakdownDto> result = new ArrayList<>();
                int total = queryResults.stream()
                                .mapToInt(row -> ((Number) row.getOrDefault("count", 0)).intValue())
                                .sum();

                for (Map<String, Object> row : queryResults) {
                        String type = row.get("type").toString();
                        Integer count = ((Number) row.getOrDefault("count", 0)).intValue();
                        Integer percentage = total > 0 ? (count * 100) / total : 0;

                        result.add(AppointmentTypeBreakdownDto.builder()
                                        .name(typeNames.getOrDefault(type, type))
                                        .value(percentage)
                                        .count(count)
                                        .build());
                }
                return result;
        }

        private List<TimeSlotStatsDto> buildTimeSlotStats(List<Map<String, Object>> queryResults) {
                List<TimeSlotStatsDto> result = new ArrayList<>();
                for (Map<String, Object> row : queryResults) {
                        String timeSlot = (String) row.get("timeSlot");
                        Integer bookings = ((Number) row.getOrDefault("bookings", 0)).intValue();

                        result.add(TimeSlotStatsDto.builder()
                                        .time(timeSlot)
                                        .bookings(bookings)
                                        .build());
                }
                return result;
        }
}
