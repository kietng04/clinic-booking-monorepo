package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find by patient
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    // Find by doctor
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    // Find by status
    Page<Appointment> findByStatus(Appointment.AppointmentStatus status, Pageable pageable);

    // Find by patient and status
    Page<Appointment> findByPatientIdAndStatus(Long patientId, Appointment.AppointmentStatus status, Pageable pageable);

    // Find by doctor and status
    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, Appointment.AppointmentStatus status, Pageable pageable);

    // Find by date
    List<Appointment> findByAppointmentDate(LocalDate date);

    // Find by doctor and date
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    // Check if time slot is available (exact time)
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.appointmentTime = :time " +
            "AND a.status IN ('PENDING', 'CONFIRMED')")
    boolean existsByDoctorIdAndDateAndTime(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("time") java.time.LocalTime time);

    // Check if time slot overlaps with existing appointments (considering duration)
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.status IN ('PENDING', 'CONFIRMED') " +
            "AND (" +
            "  (a.appointmentTime <= :startTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) > :startTime) " +
            "  OR (a.appointmentTime < :endTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) >= :endTime) " +
            "  OR (a.appointmentTime >= :startTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) <= :endTime) " +
            ")")
    boolean hasOverlappingAppointment(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime);

    // Alternative simpler overlap check using native query for PostgreSQL
    @Query(value = "SELECT COUNT(*) > 0 FROM appointments a WHERE a.doctor_id = :doctorId " +
            "AND a.appointment_date = :date " +
            "AND a.status IN ('PENDING', 'CONFIRMED') " +
            "AND a.appointment_time < :endTime " +
            "AND (a.appointment_time + CAST(a.duration_minutes || ' minutes' AS interval)) > :startTime",
            nativeQuery = true)
    boolean hasOverlappingAppointmentNative(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime);

    // Search appointments
    @Query("SELECT a FROM Appointment a WHERE " +
            "(:patientId IS NULL OR a.patientId = :patientId) " +
            "AND (:doctorId IS NULL OR a.doctorId = :doctorId) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate) " +
            "AND (:toDate IS NULL OR a.appointmentDate <= :toDate)")
    Page<Appointment> searchAppointments(
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            @Param("status") Appointment.AppointmentStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    // Statistics queries
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") Appointment.AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.type = :type")
    long countByType(@Param("type") Appointment.AppointmentType type);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.priority = :priority")
    long countByPriority(@Param("priority") Appointment.Priority priority);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate >= CURRENT_DATE AND a.status IN ('PENDING', 'CONFIRMED')")
    long countUpcomingAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE YEAR(a.appointmentDate) = YEAR(CURRENT_DATE()) AND MONTH(a.appointmentDate) = MONTH(CURRENT_DATE())")
    long countAppointmentsThisMonth();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE YEAR(a.appointmentDate) = YEAR(CURRENT_DATE()) AND MONTH(a.appointmentDate) = MONTH(CURRENT_DATE()) AND WEEK(a.appointmentDate) = WEEK(CURRENT_DATE())")
    long countAppointmentsThisWeek();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.appointmentDate) = CURRENT_DATE")
    long countAppointmentsToday();
}
