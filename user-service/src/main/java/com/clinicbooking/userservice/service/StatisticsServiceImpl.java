package com.clinicbooking.userservice.service;

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

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final UserRepository userRepository;
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
