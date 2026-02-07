package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.entity.PaymentTransaction;
import com.clinicbooking.paymentservice.entity.RefundTransaction;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import com.clinicbooking.paymentservice.enums.RefundStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("RefundTransactionRepository Tests")
class RefundTransactionRepositoryTest {

    @Autowired
    private RefundTransactionRepository refundTransactionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private PaymentOrder paymentOrder;
    private PaymentTransaction paymentTransaction;

    @BeforeEach
    void setUp() {
        paymentOrder = PaymentOrder.builder()
                .orderId("ORDER123456789")
                .appointmentId(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("100000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();

        paymentOrder = entityManager.persist(paymentOrder);

        paymentTransaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("REQ123456")
                .requestType("captureWallet")
                .transId(999888777L)
                .amount(100000L)
                .resultCode(0)
                .message("Success")
                .build();

        paymentTransaction = entityManager.persist(paymentTransaction);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should save and find refund by refund ID")
    void testSaveAndFindByRefundId() {
        RefundTransaction refund = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND123456")
                .transId(999888777L)
                .amount(new BigDecimal("50000.00"))
                .reason("Customer requested refund")
                .status(RefundStatus.PENDING)
                .build();

        refundTransactionRepository.save(refund);
        entityManager.flush();

        Optional<RefundTransaction> found = refundTransactionRepository.findByRefundId("REFUND123456");

        assertThat(found).isPresent();
        assertThat(found.get().getRefundId()).isEqualTo("REFUND123456");
        assertThat(found.get().getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should find refunds by payment order ID")
    void testFindByPaymentOrderId() {
        RefundTransaction refund1 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND001")
                .transId(999888777L)
                .amount(new BigDecimal("30000.00"))
                .reason("Partial refund 1")
                .status(RefundStatus.COMPLETED)
                .build();

        RefundTransaction refund2 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND002")
                .transId(999888777L)
                .amount(new BigDecimal("20000.00"))
                .reason("Partial refund 2")
                .status(RefundStatus.COMPLETED)
                .build();

        refundTransactionRepository.save(refund1);
        refundTransactionRepository.save(refund2);
        entityManager.flush();

        List<RefundTransaction> refunds = refundTransactionRepository.findByPaymentOrderId(paymentOrder.getId());

        assertThat(refunds).hasSize(2);
        assertThat(refunds).extracting(RefundTransaction::getRefundId)
                .containsExactlyInAnyOrder("REFUND001", "REFUND002");
    }

    @Test
    @DisplayName("Should find refunds by status")
    void testFindByStatus() {
        RefundTransaction pending = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("PENDING001")
                .transId(999888777L)
                .amount(new BigDecimal("25000.00"))
                .reason("Pending refund")
                .status(RefundStatus.PENDING)
                .build();

        RefundTransaction completed = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("COMPLETED001")
                .transId(999888777L)
                .amount(new BigDecimal("35000.00"))
                .reason("Completed refund")
                .status(RefundStatus.COMPLETED)
                .build();

        refundTransactionRepository.save(pending);
        refundTransactionRepository.save(completed);
        entityManager.flush();

        List<RefundTransaction> pendingRefunds = refundTransactionRepository.findByStatus(RefundStatus.PENDING);
        List<RefundTransaction> completedRefunds = refundTransactionRepository.findByStatus(RefundStatus.COMPLETED);

        assertThat(pendingRefunds).hasSize(1);
        assertThat(completedRefunds).hasSize(1);
    }

    @Test
    @DisplayName("Should calculate total refunded amount for payment order")
    void testGetTotalRefundedAmountByPaymentOrder() {
        RefundTransaction refund1 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND001")
                .transId(999888777L)
                .amount(new BigDecimal("30000.00"))
                .reason("First refund")
                .status(RefundStatus.COMPLETED)
                .build();

        RefundTransaction refund2 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND002")
                .transId(999888777L)
                .amount(new BigDecimal("20000.00"))
                .reason("Second refund")
                .status(RefundStatus.COMPLETED)
                .build();

        RefundTransaction pending = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REFUND003")
                .transId(999888777L)
                .amount(new BigDecimal("10000.00"))
                .reason("Pending refund")
                .status(RefundStatus.PENDING)
                .build();

        refundTransactionRepository.save(refund1);
        refundTransactionRepository.save(refund2);
        refundTransactionRepository.save(pending);
        entityManager.flush();

        BigDecimal totalRefunded = refundTransactionRepository
                .getTotalRefundedAmountByPaymentOrder(paymentOrder.getId());

        assertThat(totalRefunded).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should count pending refunds")
    void testCountPendingRefunds() {
        RefundTransaction pending1 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("PENDING001")
                .transId(999888777L)
                .amount(new BigDecimal("15000.00"))
                .reason("Pending 1")
                .status(RefundStatus.PENDING)
                .build();

        RefundTransaction pending2 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("PENDING002")
                .transId(999888777L)
                .amount(new BigDecimal("25000.00"))
                .reason("Pending 2")
                .status(RefundStatus.PENDING)
                .build();

        refundTransactionRepository.save(pending1);
        refundTransactionRepository.save(pending2);
        entityManager.flush();

        long count = refundTransactionRepository.countPendingRefunds();

        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should check if refund exists by refund ID")
    void testExistsByRefundId() {
        RefundTransaction refund = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("UNIQUE001")
                .transId(999888777L)
                .amount(new BigDecimal("40000.00"))
                .reason("Test refund")
                .status(RefundStatus.COMPLETED)
                .build();

        refundTransactionRepository.save(refund);
        entityManager.flush();

        boolean exists = refundTransactionRepository.existsByRefundId("UNIQUE001");
        boolean notExists = refundTransactionRepository.existsByRefundId("NOTFOUND");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find all completed refunds")
    void testFindCompletedRefunds() {
        RefundTransaction completed = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("COMPLETED001")
                .transId(999888777L)
                .amount(new BigDecimal("45000.00"))
                .reason("Completed refund")
                .status(RefundStatus.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();

        RefundTransaction pending = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("PENDING001")
                .transId(999888777L)
                .amount(new BigDecimal("15000.00"))
                .reason("Pending refund")
                .status(RefundStatus.PENDING)
                .build();

        refundTransactionRepository.save(completed);
        refundTransactionRepository.save(pending);
        entityManager.flush();

        List<RefundTransaction> completedRefunds = refundTransactionRepository.findCompletedRefunds();

        assertThat(completedRefunds).hasSize(1);
        assertThat(completedRefunds.get(0).getStatus()).isEqualTo(RefundStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should calculate total refunded amount across all orders")
    void testGetTotalRefundedAmount() {
        PaymentOrder order2 = PaymentOrder.builder()
                .orderId("ORDER987654321")
                .appointmentId(2L)
                .patientId(101L)
                .doctorId(201L)
                .patientName("Jane Smith")
                .patientEmail("jane@example.com")
                .patientPhone("0987654321")
                .doctorName("Dr. Johnson")
                .amount(new BigDecimal("80000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();
        order2 = entityManager.persist(order2);

        PaymentTransaction transaction2 = PaymentTransaction.builder()
                .paymentOrder(order2)
                .partnerCode("MOMO")
                .requestId("REQ987654")
                .requestType("captureWallet")
                .transId(111222333L)
                .amount(80000L)
                .resultCode(0)
                .build();
        transaction2 = entityManager.persist(transaction2);

        RefundTransaction refund1 = RefundTransaction.builder()
                .paymentOrder(paymentOrder)
                .paymentTransaction(paymentTransaction)
                .refundId("REF001")
                .transId(999888777L)
                .amount(new BigDecimal("30000.00"))
                .reason("Refund 1")
                .status(RefundStatus.COMPLETED)
                .build();

        RefundTransaction refund2 = RefundTransaction.builder()
                .paymentOrder(order2)
                .paymentTransaction(transaction2)
                .refundId("REF002")
                .transId(111222333L)
                .amount(new BigDecimal("40000.00"))
                .reason("Refund 2")
                .status(RefundStatus.COMPLETED)
                .build();

        refundTransactionRepository.save(refund1);
        refundTransactionRepository.save(refund2);
        entityManager.flush();

        BigDecimal totalRefunded = refundTransactionRepository.getTotalRefundedAmount();

        assertThat(totalRefunded).isEqualByComparingTo(new BigDecimal("70000.00"));
    }
}
