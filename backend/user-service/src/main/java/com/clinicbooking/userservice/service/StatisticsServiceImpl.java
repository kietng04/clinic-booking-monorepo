package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.client.AppointmentServiceClient;
import com.clinicbooking.userservice.dto.statistics.PatientDemographicsDto;
import com.clinicbooking.userservice.dto.statistics.SpecializationDistributionDto;
import com.clinicbooking.userservice.dto.statistics.UserGrowthDto;
import com.clinicbooking.userservice.dto.statistics.UserStatisticsDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final UserRepository userRepository;
    private final AppointmentServiceClient appointmentServiceClient;
    private static final int CACHE_DURATION_MINUTES = 5;

    @Override
    @Cacheable(value = "userStatistics", unless = "#result == null")
    public UserStatisticsDto getUserStatistics() {
        log.info("Fetching user statistics from database");

        try {
            // Get total counts using efficient COUNT queries
            long totalUsers = userRepository.count();
            long totalPatients = countUsersByRole(User.UserRole.PATIENT);
            long totalDoctors = countUsersByRole(User.UserRole.DOCTOR);
            long activeUsers = userRepository.countActiveUsers();
            long inactiveUsers = userRepository.countInactiveUsers();

            // Get this month statistics
            long newUsersThisMonth = userRepository.countNewUsersThisMonth();
            long newPatientsThisMonth = userRepository.countNewUsersByRoleThisMonth(User.UserRole.PATIENT);
            long newDoctorsThisMonth = userRepository.countNewUsersByRoleThisMonth(User.UserRole.DOCTOR);

            // Get verified users
            long emailVerifiedUsers = userRepository.countEmailVerifiedUsers();
            long phoneVerifiedUsers = userRepository.countPhoneVerifiedUsers();

            return UserStatisticsDto.builder()
                    .totalUsers(totalUsers)
                    .totalPatients(totalPatients)
                    .totalDoctors(totalDoctors)
                    .activeUsers(activeUsers)
                    .inactiveUsers(inactiveUsers)
                    .newUsersThisMonth(newUsersThisMonth)
                    .newPatientsThisMonth(newPatientsThisMonth)
                    .newDoctorsThisMonth(newDoctorsThisMonth)
                    .emailVerifiedUsers(emailVerifiedUsers)
                    .phoneVerifiedUsers(phoneVerifiedUsers)
                    .generatedAt(LocalDateTime.now())
                    .cacheDurationMinutes(CACHE_DURATION_MINUTES)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching user statistics", e);
            throw new RuntimeException("Failed to fetch user statistics", e);
        }
    }

    @Override
    @CacheEvict(value = "userStatistics", allEntries = true)
    public void clearStatisticsCache() {
        log.info("Cleared user statistics cache");
    }

    @Override
    public List<UserGrowthDto> getUserGrowthByMonth(int months) {
        log.info("Fetching user growth for {} months", months);

        try {
            LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
            List<Map<String, Object>> queryResults = userRepository.getUserGrowthByMonth(startDate);

            // Create a map for quick lookup
            Map<String, UserGrowthDto> growthMap = new HashMap<>();
            for (Map<String, Object> row : queryResults) {
                String month = (String) row.get("month");
                Integer patients = ((Number) row.getOrDefault("patients", 0)).intValue();
                Integer doctors = ((Number) row.getOrDefault("doctors", 0)).intValue();
                Integer total = ((Number) row.getOrDefault("total", 0)).intValue();

                growthMap.put(month, UserGrowthDto.builder()
                        .month(month)
                        .patients(patients)
                        .doctors(doctors)
                        .total(total)
                        .build());
            }

            // Generate list with all months (fill zeros for missing months)
            List<UserGrowthDto> result = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime date = now.minusMonths(i);
                String monthKey = date.format(formatter);
                String monthName = "Tháng " + date.getMonthValue();

                UserGrowthDto growth = growthMap.getOrDefault(monthKey,
                        UserGrowthDto.builder()
                                .month(monthName)
                                .patients(0)
                                .doctors(0)
                                .total(0)
                                .build());
                growth.setMonth(monthName); // Update to localized name
                result.add(growth);
            }

            return result;

        } catch (Exception e) {
            log.error("Error fetching user growth", e);
            throw new RuntimeException("Failed to fetch user growth", e);
        }
    }

    @Override
    public List<SpecializationDistributionDto> getSpecializationDistribution() {
        log.info("Fetching specialization distribution");

        try {
            List<Map<String, Object>> queryResults = userRepository.getSpecializationDistribution();

            // Calculate total for percentage
            int totalDoctors = queryResults.stream()
                    .mapToInt(row -> ((Number) row.getOrDefault("count", 0)).intValue())
                    .sum();

            List<SpecializationDistributionDto> result = new ArrayList<>();
            for (Map<String, Object> row : queryResults) {
                String specialization = (String) row.get("specialization");
                Integer count = ((Number) row.getOrDefault("count", 0)).intValue();
                Integer percentage = totalDoctors > 0 ? (count * 100) / totalDoctors : 0;

                result.add(SpecializationDistributionDto.builder()
                        .specialization(specialization)
                        .count(count)
                        .percentage(percentage)
                        .build());
            }

            return result;

        } catch (Exception e) {
            log.error("Error fetching specialization distribution", e);
            throw new RuntimeException("Failed to fetch specialization distribution", e);
        }
    }

    @Override
    public PatientDemographicsDto getPatientDemographics(Long doctorId) {
        log.info("Fetching patient demographics for doctor: {}", doctorId);

        try {
            List<Long> patientIds = appointmentServiceClient.getPatientIdsForDoctor(doctorId);
            if (patientIds == null || patientIds.isEmpty()) {
                return emptyDemographics();
            }

            List<User> patients = userRepository.findAllById(patientIds);

            Map<String, Integer> ageBuckets = new HashMap<>();
            ageBuckets.put("0-17", 0);
            ageBuckets.put("18-30", 0);
            ageBuckets.put("31-50", 0);
            ageBuckets.put("51-70", 0);
            ageBuckets.put("70+", 0);

            Map<String, Integer> genderCounts = new HashMap<>();
            genderCounts.put("Nam", 0);
            genderCounts.put("Nữ", 0);
            genderCounts.put("Khác", 0);

            LocalDate today = LocalDate.now();
            for (User u : patients) {
                if (u.getDateOfBirth() != null) {
                    int age = Period.between(u.getDateOfBirth(), today).getYears();
                    String bucket = age < 18 ? "0-17"
                            : age <= 30 ? "18-30"
                            : age <= 50 ? "31-50"
                            : age <= 70 ? "51-70"
                            : "70+";
                    ageBuckets.merge(bucket, 1, Integer::sum);
                }

                String gender = u.getGender() != null ? u.getGender().name() : "OTHER";
                String label = switch (gender) {
                    case "MALE" -> "Nam";
                    case "FEMALE" -> "Nữ";
                    default -> "Khác";
                };
                genderCounts.merge(label, 1, Integer::sum);
            }

            List<PatientDemographicsDto.AgeDistributionItem> ageDistribution = ageBuckets.entrySet().stream()
                    .map(e -> PatientDemographicsDto.AgeDistributionItem.builder()
                            .range(e.getKey()).count(e.getValue()).build())
                    .collect(Collectors.toList());

            int genderTotal = genderCounts.values().stream().mapToInt(Integer::intValue).sum();
            List<PatientDemographicsDto.GenderRatioItem> genderRatio = genderCounts.entrySet().stream()
                    .map(e -> PatientDemographicsDto.GenderRatioItem.builder()
                            .gender(e.getKey())
                            .count(e.getValue())
                            .percentage(genderTotal > 0 ? (int) Math.round(e.getValue() * 100.0 / genderTotal) : 0)
                            .build())
                    .collect(Collectors.toList());

            return PatientDemographicsDto.builder()
                    .ageDistribution(ageDistribution)
                    .genderRatio(genderRatio)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching patient demographics for doctorId: {}", doctorId, e);
            throw new RuntimeException("Failed to fetch patient demographics", e);
        }
    }

    private PatientDemographicsDto emptyDemographics() {
        return PatientDemographicsDto.builder()
                .ageDistribution(List.of(
                        PatientDemographicsDto.AgeDistributionItem.builder().range("18-30").count(0).build(),
                        PatientDemographicsDto.AgeDistributionItem.builder().range("31-50").count(0).build(),
                        PatientDemographicsDto.AgeDistributionItem.builder().range("51-70").count(0).build(),
                        PatientDemographicsDto.AgeDistributionItem.builder().range("70+").count(0).build()))
                .genderRatio(List.of(
                        PatientDemographicsDto.GenderRatioItem.builder().gender("Nam").count(0).percentage(0).build(),
                        PatientDemographicsDto.GenderRatioItem.builder().gender("Nữ").count(0).percentage(0).build()))
                .build();
    }

    /**
     * Count users by role efficiently
     * Uses pagination with size 1 to get total count without loading data
     */
    private long countUsersByRole(User.UserRole role) {
        Pageable pageable = PageRequest.of(0, 1);
        Page<User> page = userRepository.findByRole(role, pageable);
        return page.getTotalElements();
    }
}
