package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class DoctorScheduleRepositoryTest {

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private TestEntityManager entityManager;

    private DoctorSchedule schedule1;
    private DoctorSchedule schedule2;
    private DoctorSchedule schedule3;

    @BeforeEach
    void setUp() {
        // Clear all schedules
        doctorScheduleRepository.deleteAll();

        // Create test schedules
        schedule1 = DoctorSchedule.builder()
                .doctorId(1L)
                .doctorName("Dr. Smith")
                .dayOfWeek(1) // Monday
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .isAvailable(true)
                .build();

        schedule2 = DoctorSchedule.builder()
                .doctorId(1L)
                .doctorName("Dr. Smith")
                .dayOfWeek(2) // Tuesday
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(18, 0))
                .isAvailable(true)
                .build();

        schedule3 = DoctorSchedule.builder()
                .doctorId(2L)
                .doctorName("Dr. Johnson")
                .dayOfWeek(1) // Monday
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(16, 0))
                .isAvailable(false)
                .build();

        schedule1 = entityManager.persistAndFlush(schedule1);
        schedule2 = entityManager.persistAndFlush(schedule2);
        schedule3 = entityManager.persistAndFlush(schedule3);
    }

    @Test
    void testFindByDoctorId() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository.findByDoctorId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DoctorSchedule::getDoctorId)
                .containsOnly(1L);
    }

    @Test
    void testFindByDoctorId_NotFound() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository.findByDoctorId(999L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByDoctorIdAndDayOfWeek() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository
                .findByDoctorIdAndDayOfWeek(1L, 1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDoctorId()).isEqualTo(1L);
        assertThat(result.get(0).getDayOfWeek()).isEqualTo(1);
    }

    @Test
    void testFindByDoctorIdAndDayOfWeek_NotFound() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository
                .findByDoctorIdAndDayOfWeek(1L, 5);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByDoctorIdAndIsAvailableTrue() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository
                .findByDoctorIdAndIsAvailableTrue(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DoctorSchedule::getIsAvailable)
                .containsOnly(true);
    }

    @Test
    void testFindByDoctorIdAndIsAvailableTrue_OnlyAvailable() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository
                .findByDoctorIdAndIsAvailableTrue(2L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty(); // Doctor 2 has no available schedules
    }

    @Test
    void testFindByDayOfWeekAndIsAvailableTrue() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository
                .findByDayOfWeekAndIsAvailableTrue(1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDayOfWeek()).isEqualTo(1);
        assertThat(result.get(0).getIsAvailable()).isTrue();
    }

    @Test
    void testExistsByDoctorIdAndDayOfWeek_Exists() {
        // When
        boolean exists = doctorScheduleRepository.existsByDoctorIdAndDayOfWeek(1L, 1);

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByDoctorIdAndDayOfWeek_NotExists() {
        // When
        boolean exists = doctorScheduleRepository.existsByDoctorIdAndDayOfWeek(1L, 5);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testSaveAndFindById() {
        // Given
        DoctorSchedule newSchedule = DoctorSchedule.builder()
                .doctorId(3L)
                .doctorName("Dr. Brown")
                .dayOfWeek(3) // Wednesday
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .isAvailable(true)
                .build();

        // When
        DoctorSchedule saved = doctorScheduleRepository.save(newSchedule);
        DoctorSchedule found = doctorScheduleRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getDoctorId()).isEqualTo(3L);
        assertThat(found.getDoctorName()).isEqualTo("Dr. Brown");
        assertThat(found.getDayOfWeek()).isEqualTo(3);
    }

    @Test
    void testUpdateScheduleAvailability() {
        // Given
        DoctorSchedule schedule = schedule1;
        assertThat(schedule.getIsAvailable()).isTrue();

        // When
        schedule.setIsAvailable(false);
        DoctorSchedule updated = doctorScheduleRepository.save(schedule);

        // Then
        assertThat(updated.getIsAvailable()).isFalse();

        // Verify in database
        DoctorSchedule found = doctorScheduleRepository.findById(schedule.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getIsAvailable()).isFalse();
    }

    @Test
    void testDeleteSchedule() {
        // Given
        Long scheduleId = schedule1.getId();

        // When
        doctorScheduleRepository.deleteById(scheduleId);
        boolean exists = doctorScheduleRepository.existsById(scheduleId);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testGetDurationMinutes() {
        // When
        int duration = schedule1.getDurationMinutes();

        // Then
        assertThat(duration).isEqualTo(180); // 9:00 to 12:00 = 3 hours = 180 minutes
    }

    @Test
    void testGetDayOfWeekVietnamese() {
        // When
        String dayName = schedule1.getDayOfWeekVietnamese();

        // Then
        assertThat(dayName).isEqualTo("Thứ hai");
    }

    @Test
    void testFindAll() {
        // When
        List<DoctorSchedule> result = doctorScheduleRepository.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }
}
