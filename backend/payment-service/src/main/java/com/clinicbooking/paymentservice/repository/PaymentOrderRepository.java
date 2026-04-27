package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    
    Optional<PaymentOrder> findByOrderId(String orderId);

    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT po FROM PaymentOrder po WHERE po.orderId = :orderId")
    Optional<PaymentOrder> findByOrderIdWithLock(@Param("orderId") String orderId);

    
    Optional<PaymentOrder> findByAppointmentId(Long appointmentId);

    Optional<PaymentOrder> findTopByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);

    
    Page<PaymentOrder> findByPatientId(Long patientId, Pageable pageable);

    
    Page<PaymentOrder> findByDoctorId(Long doctorId, Pageable pageable);

    
    List<PaymentOrder> findByStatus(PaymentStatus status);


    Page<PaymentOrder> findByStatus(PaymentStatus status, Pageable pageable);

    /**
     * Find payment orders by status ordered by creation date ascending
     * Used for receptionist dashboard to show oldest pending payments first
     */
    Page<PaymentOrder> findByStatusOrderByCreatedAtAsc(PaymentStatus status, Pageable pageable);

    /**
     * Find payment orders by status and payment method (for counter payments)
     * Used for receptionist dashboard to show only counter payment methods
     */
    @Query("SELECT po FROM PaymentOrder po WHERE po.status = :status AND po.paymentMethod IN :methods ORDER BY po.createdAt ASC")
    Page<PaymentOrder> findByStatusAndPaymentMethodInOrderByCreatedAtAsc(
            @Param("status") PaymentStatus status,
            @Param("methods") java.util.List<PaymentMethod> methods,
            Pageable pageable);

    List<PaymentOrder> findByPatientIdAndStatus(Long patientId, PaymentStatus status);

    
    Page<PaymentOrder> findByPatientIdAndStatus(Long patientId, PaymentStatus status, Pageable pageable);

    
    List<PaymentOrder> findByDoctorIdAndStatus(Long doctorId, PaymentStatus status);

    
    Page<PaymentOrder> findByDoctorIdAndStatus(Long doctorId, PaymentStatus status, Pageable pageable);

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentOrder> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.createdAt BETWEEN :startDate AND :endDate AND po.status = 'COMPLETED'")
    List<PaymentOrder> findCompletedByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.patientId = :patientId AND po.createdAt BETWEEN :startDate AND :endDate")
    Page<PaymentOrder> findByPatientIdAndCreatedAtBetween(@Param("patientId") Long patientId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.doctorId = :doctorId AND po.createdAt BETWEEN :startDate AND :endDate")
    Page<PaymentOrder> findByDoctorIdAndCreatedAtBetween(@Param("doctorId") Long doctorId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.expiredAt IS NOT NULL AND po.expiredAt < CURRENT_TIMESTAMP AND po.status = 'PENDING'")
    List<PaymentOrder> findExpiredOrders();

    
    @Query("SELECT po FROM PaymentOrder po WHERE po.status = 'PENDING' AND po.createdAt < :beforeTime")
    List<PaymentOrder> findPendingOrdersCreatedBefore(@Param("beforeTime") LocalDateTime beforeTime);

    
    boolean existsByAppointmentId(Long appointmentId);

    boolean existsByAppointmentIdAndStatusIn(Long appointmentId, Collection<PaymentStatus> statuses);

    
    long countByPatientIdAndStatus(Long patientId, PaymentStatus status);

    
    long countByDoctorIdAndStatus(Long doctorId, PaymentStatus status);

    
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po WHERE po.status = 'COMPLETED'")
    java.math.BigDecimal getTotalRevenueForCompletedOrders();

    
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po WHERE po.doctorId = :doctorId AND po.status = 'COMPLETED'")
    java.math.BigDecimal getTotalRevenueByDoctor(@Param("doctorId") Long doctorId);

    
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po WHERE po.patientId = :patientId AND po.status = 'COMPLETED'")
    java.math.BigDecimal getTotalAmountPaidByPatient(@Param("patientId") Long patientId);
}
