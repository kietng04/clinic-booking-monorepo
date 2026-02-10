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
import java.util.Map;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        // Find by patient
        Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

        // Find by doctor
        Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

        // Find by status
        Page<Appointment> findByStatus(Appointment.AppointmentStatus status, Pageable pageable);

        // Find by patient and status
        Page<Appointment> findByPatientIdAndStatus(Long patientId, Appointment.AppointmentStatus status,
                        Pageable pageable);

        // Find by doctor and status
        Page<Appointment> findByDoctorIdAndStatus(Long doctorId, Appointment.AppointmentStatus status,
                        Pageable pageable);

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
                        "  (a.appointmentTime <= :startTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) > :startTime) "
                        +
                        "  OR (a.appointmentTime < :endTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) >= :endTime) "
                        +
                        "  OR (a.appointmentTime >= :startTime AND FUNCTION('ADDTIME', a.appointmentTime, FUNCTION('SEC_TO_TIME', a.durationMinutes * 60)) <= :endTime) "
                        +
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
                        "AND (a.appointment_time + CAST(a.duration_minutes || ' minutes' AS interval)) > :startTime", nativeQuery = true)
        boolean hasOverlappingAppointmentNative(
                        @Param("doctorId") Long doctorId,
                        @Param("date") LocalDate date,
                        @Param("startTime") java.time.LocalTime startTime,
                        @Param("endTime") java.time.LocalTime endTime);

        // Search appointments
        // NOTE: Avoid `:param IS NULL OR ...` patterns for LocalDate on PostgreSQL.
        // Hibernate may bind the `IS NULL` parameter occurrence without a concrete type,
        // leading to `could not determine data type of parameter $N` at runtime.
        @Query("SELECT a FROM Appointment a WHERE " +
                        "a.patientId = COALESCE(:patientId, a.patientId) " +
                        "AND a.doctorId = COALESCE(:doctorId, a.doctorId) " +
                        "AND a.status = COALESCE(:status, a.status) " +
                        "AND a.appointmentDate >= COALESCE(:fromDate, a.appointmentDate) " +
                        "AND a.appointmentDate <= COALESCE(:toDate, a.appointmentDate)")
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

        @Query(value = "SELECT COUNT(*) FROM appointments a WHERE EXTRACT(YEAR FROM a.appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM a.appointment_date) = EXTRACT(MONTH FROM CURRENT_DATE)", nativeQuery = true)
        long countAppointmentsThisMonth();

        @Query(value = "SELECT COUNT(*) FROM appointments a WHERE EXTRACT(YEAR FROM a.appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(WEEK FROM a.appointment_date) = EXTRACT(WEEK FROM CURRENT_DATE)", nativeQuery = true)
        long countAppointmentsThisWeek();

        @Query(value = "SELECT COUNT(*) FROM appointments a WHERE DATE(a.appointment_date) = CURRENT_DATE", nativeQuery = true)
        long countAppointmentsToday();

        // Analytics queries for dashboard

        // Monthly revenue aggregation (last N months)
        @Query("SELECT new map(FUNCTION('TO_CHAR', a.appointmentDate, 'YYYY-MM') as month, " +
                        "SUM(CASE WHEN a.status = 'COMPLETED' THEN a.serviceFee ELSE 0 END) as revenue) " +
                        "FROM Appointment a " +
                        "WHERE a.appointmentDate >= :startDate " +
                        "GROUP BY FUNCTION('TO_CHAR', a.appointmentDate, 'YYYY-MM') " +
                        "ORDER BY month")
        List<Map<String, Object>> getMonthlyRevenue(@Param("startDate") LocalDate startDate);

        // Appointment trends by month
        @Query("SELECT new map(FUNCTION('TO_CHAR', a.appointmentDate, 'YYYY-MM') as month, " +
                        "COUNT(a) as total, " +
                        "SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, " +
                        "SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled) " +
                        "FROM Appointment a " +
                        "WHERE a.appointmentDate >= :startDate " +
                        "GROUP BY FUNCTION('TO_CHAR', a.appointmentDate, 'YYYY-MM') " +
                        "ORDER BY month")
        List<Map<String, Object>> getAppointmentTrendsByMonth(@Param("startDate") LocalDate startDate);

        // Appointment status distribution
        @Query("SELECT new map(a.status as status, COUNT(a) as count) " +
                        "FROM Appointment a " +
                        "GROUP BY a.status")
        List<Map<String, Object>> getStatusDistribution();

        // Appointment type breakdown for doctor
        @Query("SELECT new map(a.type as type, COUNT(a) as count) " +
                        "FROM Appointment a " +
                        "WHERE a.doctorId = :doctorId " +
                        "GROUP BY a.type")
        List<Map<String, Object>> getAppointmentTypeBreakdown(@Param("doctorId") Long doctorId);

        // Time slot popularity for doctor
        @Query("SELECT new map(FUNCTION('TO_CHAR', a.appointmentTime, 'HH24:MI') as timeSlot, COUNT(a) as bookings) " +
                        "FROM Appointment a " +
                        "WHERE a.doctorId = :doctorId " +
                        "GROUP BY FUNCTION('TO_CHAR', a.appointmentTime, 'HH24:MI') " +
                        "ORDER BY timeSlot")
        List<Map<String, Object>> getTimeSlotStats(@Param("doctorId") Long doctorId);

        @Query("SELECT DISTINCT a.patientId FROM Appointment a WHERE a.doctorId = :doctorId")
        List<Long> getDistinctPatientIdsForDoctor(@Param("doctorId") Long doctorId);

        // Top doctors by appointment count
        @Query("SELECT new map(a.doctorId as doctorId, a.doctorName as doctorName, " +
                        "COUNT(a) as totalAppointments, " +
                        "SUM(CASE WHEN a.status = 'COMPLETED' THEN a.serviceFee ELSE 0 END) as totalRevenue, " +
                        "SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
                        "COUNT(a) as totalCount) " +
                        "FROM Appointment a " +
                        "GROUP BY a.doctorId, a.doctorName " +
                        "ORDER BY totalAppointments DESC")
        List<Map<String, Object>> getTopDoctorStats(Pageable pageable);

        // Recent appointments for activity feed
        @Query("SELECT a FROM Appointment a " +
                        "ORDER BY a.createdAt DESC")
        List<Appointment> getRecentAppointments(Pageable pageable);
}
