package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.RefundTransaction;
import com.clinicbooking.paymentservice.enums.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundTransactionRepository extends JpaRepository<RefundTransaction, Long> {

    
    Optional<RefundTransaction> findByRefundId(String refundId);

    
    List<RefundTransaction> findByPaymentOrderId(Long paymentOrderId);

    
    Page<RefundTransaction> findByPaymentOrderId(Long paymentOrderId, Pageable pageable);

    
    List<RefundTransaction> findByPaymentTransactionId(Long paymentTransactionId);

    
    Optional<RefundTransaction> findByTransId(Long transId);

    
    List<RefundTransaction> findByStatus(RefundStatus status);

    
    Page<RefundTransaction> findByStatus(RefundStatus status, Pageable pageable);

    
    List<RefundTransaction> findByPaymentOrderIdAndStatus(Long paymentOrderId, RefundStatus status);

    
    Page<RefundTransaction> findByPaymentOrderIdAndStatus(Long paymentOrderId, RefundStatus status, Pageable pageable);

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.status = 'COMPLETED'")
    List<RefundTransaction> findCompletedRefunds();

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.status = 'PENDING'")
    List<RefundTransaction> findPendingRefunds();

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.status = 'FAILED'")
    List<RefundTransaction> findFailedRefunds();

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.createdAt BETWEEN :startDate AND :endDate")
    List<RefundTransaction> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.paymentOrder.id = :paymentOrderId AND rt.createdAt BETWEEN :startDate AND :endDate")
    List<RefundTransaction> findByPaymentOrderIdAndCreatedAtBetween(@Param("paymentOrderId") Long paymentOrderId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.paymentOrder.id = :paymentOrderId AND rt.status = 'COMPLETED' AND rt.completedAt BETWEEN :startDate AND :endDate")
    List<RefundTransaction> findCompletedByPaymentOrderIdAndCompletedAtBetween(@Param("paymentOrderId") Long paymentOrderId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    boolean existsByRefundId(String refundId);

    
    boolean existsByTransId(Long transId);

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.status = 'PENDING' AND rt.createdAt < :beforeTime")
    List<RefundTransaction> findPendingRefundsCreatedBefore(@Param("beforeTime") LocalDateTime beforeTime);

    
    @Query("SELECT COUNT(rt) FROM RefundTransaction rt WHERE rt.paymentOrder.id = :paymentOrderId AND rt.status = 'COMPLETED'")
    long countCompletedRefundsByPaymentOrder(@Param("paymentOrderId") Long paymentOrderId);

    
    @Query("SELECT COUNT(rt) FROM RefundTransaction rt WHERE rt.status = 'PENDING'")
    long countPendingRefunds();

    
    @Query("SELECT COALESCE(SUM(rt.amount), 0) FROM RefundTransaction rt WHERE rt.paymentOrder.id = :paymentOrderId AND rt.status = 'COMPLETED'")
    BigDecimal getTotalRefundedAmountByPaymentOrder(@Param("paymentOrderId") Long paymentOrderId);

    
    @Query("SELECT COALESCE(SUM(rt.amount), 0) FROM RefundTransaction rt WHERE rt.status = 'COMPLETED'")
    BigDecimal getTotalRefundedAmount();

    
    List<RefundTransaction> findByResultCode(Integer resultCode);

    
    @Query("SELECT rt FROM RefundTransaction rt WHERE rt.resultCode = 0")
    List<RefundTransaction> findAllSuccessfulRefunds();

    
    @Query("SELECT COUNT(rt) FROM RefundTransaction rt WHERE rt.paymentTransaction.id = :paymentTransactionId AND rt.status = 'PENDING'")
    long countPendingRefundsByPaymentTransaction(@Param("paymentTransactionId") Long paymentTransactionId);
}
