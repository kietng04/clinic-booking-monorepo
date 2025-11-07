package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);
    Page<Appointment> findByPatientIdAndStatus(Long patientId, Appointment.AppointmentStatus status, Pageable pageable);
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);
    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, Appointment.AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
            "AND a.status IN ('PENDING', 'CONFIRMED') " +
            "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findDoctorAppointmentsByDateRange(
            @Param("doctorId") Long doctorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.status IN ('PENDING', 'CONFIRMED') " +
            "AND (:appointmentId IS NULL OR a.id != :appointmentId) " +
            "AND (a.appointmentTime <= :endTime AND " +
            "FUNCTION('DATE_ADD', FUNCTION('CAST', FUNCTION('CONCAT', CAST(a.appointmentDate AS string), ' ', CAST(a.appointmentTime AS string)), DATETIME), INTERVAL a.durationMinutes MINUTE) >= " +
            "FUNCTION('DATE_ADD', FUNCTION('CAST', FUNCTION('CONCAT', CAST(:date AS string), ' ', CAST(:startTime AS string)), DATETIME), INTERVAL 0 MINUTE))")
    boolean hasConflictingAppointment(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("appointmentId") Long appointmentId);

    @Query("SELECT a FROM Appointment a WHERE " +
            "(:patientId IS NULL OR a.patient.id = :patientId) " +
            "AND (:doctorId IS NULL OR a.doctor.id = :doctorId) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:type IS NULL OR a.type = :type) " +
            "AND (:startDate IS NULL OR a.appointmentDate >= :startDate) " +
            "AND (:endDate IS NULL OR a.appointmentDate <= :endDate)")
    Page<Appointment> searchAppointments(
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            @Param("status") Appointment.AppointmentStatus status,
            @Param("type") Appointment.AppointmentType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
