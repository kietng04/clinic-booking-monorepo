package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.client.AppointmentServiceClient;
import com.clinicbooking.userservice.dto.statistics.SpecializationDistributionDto;
import com.clinicbooking.userservice.dto.statistics.UserGrowthDto;
import com.clinicbooking.userservice.dto.statistics.UserStatisticsDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentServiceClient appointmentServiceClient;

    @InjectMocks
    private StatisticsServiceImpl statisticsService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getUserStatistics_returnsCompleteStatistics() {
        // Arrange
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.findByRole(eq(User.UserRole.PATIENT), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 60L));
        when(userRepository.findByRole(eq(User.UserRole.DOCTOR), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 20L));
        when(userRepository.countActiveUsers()).thenReturn(85L);
        when(userRepository.countInactiveUsers()).thenReturn(15L);
        when(userRepository.countNewUsersThisMonth()).thenReturn(10L);
        when(userRepository.countNewUsersByRoleThisMonth(User.UserRole.PATIENT)).thenReturn(7L);
        when(userRepository.countNewUsersByRoleThisMonth(User.UserRole.DOCTOR)).thenReturn(2L);
        when(userRepository.countEmailVerifiedUsers()).thenReturn(70L);
        when(userRepository.countPhoneVerifiedUsers()).thenReturn(50L);

        // Act
        UserStatisticsDto result = statisticsService.getUserStatistics();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalUsers()).isEqualTo(100L);
        assertThat(result.getTotalPatients()).isEqualTo(60L);
        assertThat(result.getTotalDoctors()).isEqualTo(20L);
        assertThat(result.getActiveUsers()).isEqualTo(85L);
        assertThat(result.getInactiveUsers()).isEqualTo(15L);
        assertThat(result.getNewUsersThisMonth()).isEqualTo(10L);
        assertThat(result.getNewPatientsThisMonth()).isEqualTo(7L);
        assertThat(result.getNewDoctorsThisMonth()).isEqualTo(2L);
        assertThat(result.getEmailVerifiedUsers()).isEqualTo(70L);
        assertThat(result.getPhoneVerifiedUsers()).isEqualTo(50L);
        assertThat(result.getGeneratedAt()).isNotNull();

        verify(userRepository).count();
        verify(userRepository).countActiveUsers();
        verify(userRepository).countNewUsersThisMonth();
    }

    @Test
    void getUserStatistics_withZeroUsers_returnsZeroStatistics() {
        // Arrange
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.findByRole(any(), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(userRepository.countActiveUsers()).thenReturn(0L);
        when(userRepository.countInactiveUsers()).thenReturn(0L);
        when(userRepository.countNewUsersThisMonth()).thenReturn(0L);
        when(userRepository.countNewUsersByRoleThisMonth(any())).thenReturn(0L);
        when(userRepository.countEmailVerifiedUsers()).thenReturn(0L);
        when(userRepository.countPhoneVerifiedUsers()).thenReturn(0L);

        // Act
        UserStatisticsDto result = statisticsService.getUserStatistics();

        // Assert
        assertThat(result.getTotalUsers()).isEqualTo(0L);
        assertThat(result.getTotalPatients()).isEqualTo(0L);
        assertThat(result.getTotalDoctors()).isEqualTo(0L);
    }

    @Test
    void clearStatisticsCache_executesSuccessfully() {
        // Act
        statisticsService.clearStatisticsCache();

        // Assert - Should not throw exception
        verify(userRepository, never()).count();
    }

    @Test
    void getUserGrowthByMonth_returnsGrowthData() {
        // Arrange
        List<Map<String, Object>> queryResults = new ArrayList<>();

        Map<String, Object> month1 = new HashMap<>();
        month1.put("month", "2026-01");
        month1.put("patients", 10);
        month1.put("doctors", 2);
        month1.put("total", 12);
        queryResults.add(month1);

        Map<String, Object> month2 = new HashMap<>();
        month2.put("month", "2026-02");
        month2.put("patients", 15);
        month2.put("doctors", 3);
        month2.put("total", 18);
        queryResults.add(month2);

        when(userRepository.getUserGrowthByMonth(any(LocalDateTime.class))).thenReturn(queryResults);

        // Act
        List<UserGrowthDto> result = statisticsService.getUserGrowthByMonth(6);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(6); // Should return 6 months of data
        assertThat(result).allMatch(dto -> dto.getMonth() != null);

        // Check that data from query is included
        assertThat(result).anyMatch(dto ->
            dto.getPatients() == 10 && dto.getDoctors() == 2 && dto.getTotal() == 12
        );
        assertThat(result).anyMatch(dto ->
            dto.getPatients() == 15 && dto.getDoctors() == 3 && dto.getTotal() == 18
        );

        verify(userRepository).getUserGrowthByMonth(any(LocalDateTime.class));
    }

    @Test
    void getUserGrowthByMonth_withNoData_returnsZeroFilledMonths() {
        // Arrange
        when(userRepository.getUserGrowthByMonth(any(LocalDateTime.class))).thenReturn(new ArrayList<>());

        // Act
        List<UserGrowthDto> result = statisticsService.getUserGrowthByMonth(3);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).allMatch(dto -> dto.getPatients() == 0);
        assertThat(result).allMatch(dto -> dto.getDoctors() == 0);
        assertThat(result).allMatch(dto -> dto.getTotal() == 0);
    }

    @Test
    void getUserGrowthByMonth_fillsMissingMonths() {
        // Arrange
        List<Map<String, Object>> queryResults = new ArrayList<>();
        String currentMonth = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));

        Map<String, Object> month1 = new HashMap<>();
        month1.put("month", currentMonth);
        month1.put("patients", 10);
        month1.put("doctors", 2);
        month1.put("total", 12);
        queryResults.add(month1);
        // Missing the other month in the requested 2-month window.

        when(userRepository.getUserGrowthByMonth(any(LocalDateTime.class))).thenReturn(queryResults);

        // Act
        List<UserGrowthDto> result = statisticsService.getUserGrowthByMonth(2);

        // Assert
        assertThat(result).hasSize(2);
        // Should have one month with data and one month with zeros
        assertThat(result).anyMatch(dto -> dto.getTotal() == 12);
        assertThat(result).anyMatch(dto -> dto.getTotal() == 0);
    }

    @Test
    void getSpecializationDistribution_returnsDistribution() {
        // Arrange
        List<Map<String, Object>> queryResults = new ArrayList<>();

        Map<String, Object> spec1 = new HashMap<>();
        spec1.put("specialization", "Cardiology");
        spec1.put("count", 10);
        queryResults.add(spec1);

        Map<String, Object> spec2 = new HashMap<>();
        spec2.put("specialization", "Dermatology");
        spec2.put("count", 5);
        queryResults.add(spec2);

        Map<String, Object> spec3 = new HashMap<>();
        spec3.put("specialization", "Pediatrics");
        spec3.put("count", 5);
        queryResults.add(spec3);

        when(userRepository.getSpecializationDistribution()).thenReturn(queryResults);

        // Act
        List<SpecializationDistributionDto> result = statisticsService.getSpecializationDistribution();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).extracting(SpecializationDistributionDto::getSpecialization)
                .containsExactlyInAnyOrder("Cardiology", "Dermatology", "Pediatrics");

        // Check percentages (total = 20)
        SpecializationDistributionDto cardiology = result.stream()
                .filter(dto -> "Cardiology".equals(dto.getSpecialization()))
                .findFirst().orElseThrow();
        assertThat(cardiology.getCount()).isEqualTo(10);
        assertThat(cardiology.getPercentage()).isEqualTo(50); // 10/20 * 100

        verify(userRepository).getSpecializationDistribution();
    }

    @Test
    void getSpecializationDistribution_withNoData_returnsEmptyList() {
        // Arrange
        when(userRepository.getSpecializationDistribution()).thenReturn(new ArrayList<>());

        // Act
        List<SpecializationDistributionDto> result = statisticsService.getSpecializationDistribution();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void getSpecializationDistribution_calculatesPercentagesCorrectly() {
        // Arrange
        List<Map<String, Object>> queryResults = new ArrayList<>();

        Map<String, Object> spec1 = new HashMap<>();
        spec1.put("specialization", "Cardiology");
        spec1.put("count", 30);
        queryResults.add(spec1);

        Map<String, Object> spec2 = new HashMap<>();
        spec2.put("specialization", "Dermatology");
        spec2.put("count", 70);
        queryResults.add(spec2);

        when(userRepository.getSpecializationDistribution()).thenReturn(queryResults);

        // Act
        List<SpecializationDistributionDto> result = statisticsService.getSpecializationDistribution();

        // Assert
        assertThat(result).hasSize(2);

        SpecializationDistributionDto cardiology = result.stream()
                .filter(dto -> "Cardiology".equals(dto.getSpecialization()))
                .findFirst().orElseThrow();
        assertThat(cardiology.getPercentage()).isEqualTo(30); // 30/100 * 100

        SpecializationDistributionDto dermatology = result.stream()
                .filter(dto -> "Dermatology".equals(dto.getSpecialization()))
                .findFirst().orElseThrow();
        assertThat(dermatology.getPercentage()).isEqualTo(70); // 70/100 * 100
    }

    @Test
    void getPatientDemographics_returnsComputedDemographics() {
        User patient1 = User.builder()
                .id(101L)
                .role(User.UserRole.PATIENT)
                .fullName("Patient One")
                .dateOfBirth(java.time.LocalDate.now().minusYears(24))
                .gender(User.Gender.MALE)
                .build();
        User patient2 = User.builder()
                .id(102L)
                .role(User.UserRole.PATIENT)
                .fullName("Patient Two")
                .dateOfBirth(java.time.LocalDate.now().minusYears(43))
                .gender(User.Gender.FEMALE)
                .build();
        User patient3 = User.builder()
                .id(103L)
                .role(User.UserRole.PATIENT)
                .fullName("Patient Three")
                .dateOfBirth(java.time.LocalDate.now().minusYears(72))
                .gender(User.Gender.OTHER)
                .build();

        when(appointmentServiceClient.getDistinctPatientIdsForDoctor(1L))
                .thenReturn(List.of(101L, 102L, 103L, 103L));
        when(userRepository.findAllById(any(Iterable.class)))
                .thenReturn(List.of(patient1, patient2, patient3));

        var result = statisticsService.getPatientDemographics(1L);

        assertThat(result).isNotNull();
        assertThat(result.getAgeDistribution()).isNotEmpty();
        assertThat(result.getGenderRatio()).isNotEmpty();
        assertThat(result.getAgeDistribution()).anyMatch(item -> "18-30".equals(item.getRange()) && item.getCount() == 1);
        assertThat(result.getAgeDistribution()).anyMatch(item -> "31-50".equals(item.getRange()) && item.getCount() == 1);
        assertThat(result.getAgeDistribution()).anyMatch(item -> "70+".equals(item.getRange()) && item.getCount() == 1);
        assertThat(result.getGenderRatio()).anyMatch(item -> "Nam".equals(item.getGender()) && item.getCount() == 1 && item.getPercentage() == 33);
        assertThat(result.getGenderRatio()).anyMatch(item -> "Nữ".equals(item.getGender()) && item.getCount() == 1 && item.getPercentage() == 33);
        assertThat(result.getGenderRatio()).anyMatch(item -> "Khác".equals(item.getGender()) && item.getCount() == 1 && item.getPercentage() == 33);
    }

    @Test
    void getPatientDemographics_withoutAppointments_returnsEmptyDemographics() {
        when(appointmentServiceClient.getDistinctPatientIdsForDoctor(1L)).thenReturn(List.of());

        var result = statisticsService.getPatientDemographics(1L);

        assertThat(result).isNotNull();
        assertThat(result.getAgeDistribution()).allMatch(item -> item.getCount() == 0);
        assertThat(result.getGenderRatio()).allMatch(item -> item.getCount() == 0);
    }

    @Test
    void getPatientDemographics_computesRealDemographics() {
        when(appointmentServiceClient.getDistinctPatientIdsForDoctor(1L)).thenReturn(List.of(10L, 20L));

        User young = new User();
        young.setId(10L);
        young.setRole(User.UserRole.PATIENT);
        young.setDateOfBirth(LocalDate.now().minusYears(25));
        young.setGender(User.Gender.MALE);

        User older = new User();
        older.setId(20L);
        older.setRole(User.UserRole.PATIENT);
        older.setDateOfBirth(LocalDate.now().minusYears(55));
        older.setGender(User.Gender.FEMALE);

        when(userRepository.findAllById(any(Iterable.class))).thenReturn(List.of(young, older));

        var result = statisticsService.getPatientDemographics(1L);

        assertThat(result).isNotNull();
        assertThat(result.getAgeDistribution()).anyMatch(i -> "18-30".equals(i.getRange()) && i.getCount() == 1);
        assertThat(result.getAgeDistribution()).anyMatch(i -> "51-70".equals(i.getRange()) && i.getCount() == 1);
        assertThat(result.getGenderRatio()).anyMatch(i -> "Nam".equals(i.getGender()) && i.getCount() == 1);
        assertThat(result.getGenderRatio()).anyMatch(i -> "Nữ".equals(i.getGender()) && i.getCount() == 1);
    }

    @Test
    void getUserStatistics_handlesDatabaseError() {
        // Arrange
        when(userRepository.count()).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        try {
            statisticsService.getUserStatistics();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Failed to fetch user statistics");
        }
    }
}
