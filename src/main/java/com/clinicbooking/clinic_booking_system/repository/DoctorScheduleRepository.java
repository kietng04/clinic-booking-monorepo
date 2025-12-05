package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorId(Long doctorId);
    List<DoctorSchedule> findByDoctorIdAndIsAvailableTrue(Long doctorId);
    List<DoctorSchedule> findByDayOfWeekAndIsAvailableTrue(Integer dayOfWeek);
    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, Integer dayOfWeek);

    @Query("SELECT COUNT(ds) > 0 FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId " +
            "AND ds.dayOfWeek = :dayOfWeek " +
            "AND (:scheduleId IS NULL OR ds.id != :scheduleId) " +
            "AND ((ds.startTime <= :endTime AND ds.endTime >= :startTime))")
    boolean hasOverlappingSchedule(
            @Param("doctorId") Long doctorId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("scheduleId") Long scheduleId);

    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.dayOfWeek = :dayOfWeek " +
            "AND ds.isAvailable = true " +
            "AND ds.doctor.isActive = true " +
            "AND ds.doctor.role = 'DOCTOR' " +
            "ORDER BY ds.startTime")
    List<DoctorSchedule> findAvailableDoctorsByDay(@Param("dayOfWeek") Integer dayOfWeek);
}
