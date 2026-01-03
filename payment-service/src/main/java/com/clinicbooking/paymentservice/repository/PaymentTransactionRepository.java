package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    
    Optional<PaymentTransaction> findByPaymentOrderId(Long paymentOrderId);

    
    List<PaymentTransaction> findAllByPaymentOrderId(Long paymentOrderId);

    
    Optional<PaymentTransaction> findByRequestId(String requestId);

    
    Optional<PaymentTransaction> findByTransId(Long transId);

    
    List<PaymentTransaction> findByResultCode(Integer resultCode);

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.resultCode = 0")
    List<PaymentTransaction> findAllSuccessfulTransactions();

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.resultCode = 0")
    Page<PaymentTransaction> findAllSuccessfulTransactions(Pageable pageable);

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.paymentOrder.id = :paymentOrderId AND pt.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByPaymentOrderIdAndCreatedAtBetween(@Param("paymentOrderId") Long paymentOrderId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    
    boolean existsByRequestId(String requestId);

    
    boolean existsByTransId(Long transId);

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.transId IS NULL")
    List<PaymentTransaction> findPendingTransactions();

    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.payUrl IS NOT NULL AND pt.payUrl != ''")
    List<PaymentTransaction> findTransactionsWithPaymentUrl();

    
    Page<PaymentTransaction> findByPaymentOrderId(Long paymentOrderId, Pageable pageable);

    
    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.resultCode = 0")
    long countSuccessfulTransactions();

    
    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.resultCode != 0 AND pt.resultCode IS NOT NULL")
    long countFailedTransactions();

    
    @Query("SELECT pt FROM PaymentTransaction pt ORDER BY pt.createdAt DESC LIMIT 1")
    Optional<PaymentTransaction> findMostRecentTransaction();

    
    List<PaymentTransaction> findByPartnerCode(String partnerCode);
}
