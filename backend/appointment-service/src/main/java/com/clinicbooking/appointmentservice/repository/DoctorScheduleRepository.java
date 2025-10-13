package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    // Find all schedules for a doctor
    List<DoctorSchedule> findByDoctorId(Long doctorId);

    // Find schedules by doctor and day of week
    List<DoctorSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, Integer dayOfWeek);

    // Find available schedules for a doctor
    List<DoctorSchedule> findByDoctorIdAndIsAvailableTrue(Long doctorId);

    // Find all schedules for a specific day of week
    List<DoctorSchedule> findByDayOfWeekAndIsAvailableTrue(Integer dayOfWeek);

    // Check if doctor has schedule on a day
    boolean existsByDoctorIdAndDayOfWeek(Long doctorId, Integer dayOfWeek);
}
