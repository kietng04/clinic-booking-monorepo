package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.entity.PaymentTransaction;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("PaymentTransactionRepository Tests")
class PaymentTransactionRepositoryTest {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private PaymentOrder paymentOrder;

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
                .amount(new BigDecimal("50000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.PENDING)
                .build();

        paymentOrder = entityManager.persist(paymentOrder);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should save and find transaction by payment order ID")
    void testSaveAndFindByPaymentOrderId() {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("REQ123456")
                .requestType("captureWallet")
                .amount(50000000L)
                .orderInfo("Payment for appointment")
                .payUrl("http://momo.vn/pay/123")
                .build();

        paymentTransactionRepository.save(transaction);
        entityManager.flush();

        Optional<PaymentTransaction> found = paymentTransactionRepository
                .findByPaymentOrderId(paymentOrder.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getRequestId()).isEqualTo("REQ123456");
        assertThat(found.get().getAmount()).isEqualTo(50000000L);
    }

    @Test
    @DisplayName("Should find transaction by request ID")
    void testFindByRequestId() {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("UNIQUE_REQ_123")
                .requestType("captureWallet")
                .amount(50000000L)
                .build();

        paymentTransactionRepository.save(transaction);
        entityManager.flush();

        Optional<PaymentTransaction> found = paymentTransactionRepository
                .findByRequestId("UNIQUE_REQ_123");

        assertThat(found).isPresent();
        assertThat(found.get().getRequestId()).isEqualTo("UNIQUE_REQ_123");
    }

    @Test
    @DisplayName("Should find transaction by Momo transaction ID")
    void testFindByTransId() {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("REQ789")
                .requestType("captureWallet")
                .transId(999888777L)
                .amount(50000000L)
                .resultCode(0)
                .build();

        paymentTransactionRepository.save(transaction);
        entityManager.flush();

        Optional<PaymentTransaction> found = paymentTransactionRepository
                .findByTransId(999888777L);

        assertThat(found).isPresent();
        assertThat(found.get().getTransId()).isEqualTo(999888777L);
    }

    @Test
    @DisplayName("Should find all successful transactions")
    void testFindAllSuccessfulTransactions() {
        PaymentTransaction success1 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("SUCCESS_1")
                .requestType("captureWallet")
                .amount(50000000L)
                .resultCode(0)
                .build();

        PaymentTransaction success2 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("SUCCESS_2")
                .requestType("captureWallet")
                .amount(75000000L)
                .resultCode(0)
                .build();

        PaymentTransaction failed = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("FAILED_1")
                .requestType("captureWallet")
                .amount(60000000L)
                .resultCode(1004)
                .build();

        paymentTransactionRepository.save(success1);
        paymentTransactionRepository.save(success2);
        paymentTransactionRepository.save(failed);
        entityManager.flush();

        List<PaymentTransaction> successfulTransactions =
                paymentTransactionRepository.findAllSuccessfulTransactions();

        assertThat(successfulTransactions).hasSize(2);
        assertThat(successfulTransactions).allMatch(t -> t.getResultCode() == 0);
    }

    @Test
    @DisplayName("Should find transactions by result code")
    void testFindByResultCode() {
        PaymentTransaction transaction1 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("REQ_1")
                .requestType("captureWallet")
                .amount(50000000L)
                .resultCode(1004)
                .build();

        PaymentTransaction transaction2 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("REQ_2")
                .requestType("captureWallet")
                .amount(60000000L)
                .resultCode(1004)
                .build();

        paymentTransactionRepository.save(transaction1);
        paymentTransactionRepository.save(transaction2);
        entityManager.flush();

        List<PaymentTransaction> result = paymentTransactionRepository.findByResultCode(1004);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(t -> t.getResultCode() == 1004);
    }

    @Test
    @DisplayName("Should check if transaction exists by request ID")
    void testExistsByRequestId() {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("EXISTS_REQ")
                .requestType("captureWallet")
                .amount(50000000L)
                .build();

        paymentTransactionRepository.save(transaction);
        entityManager.flush();

        boolean exists = paymentTransactionRepository.existsByRequestId("EXISTS_REQ");
        boolean notExists = paymentTransactionRepository.existsByRequestId("NOT_FOUND");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find pending transactions without Momo transaction ID")
    void testFindPendingTransactions() {
        PaymentTransaction pending = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("PENDING_REQ")
                .requestType("captureWallet")
                .amount(50000000L)
                .transId(null)
                .build();

        PaymentTransaction completed = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("COMPLETED_REQ")
                .requestType("captureWallet")
                .amount(60000000L)
                .transId(999888777L)
                .build();

        paymentTransactionRepository.save(pending);
        paymentTransactionRepository.save(completed);
        entityManager.flush();

        List<PaymentTransaction> pendingTransactions =
                paymentTransactionRepository.findPendingTransactions();

        assertThat(pendingTransactions).hasSize(1);
        assertThat(pendingTransactions.get(0).getTransId()).isNull();
    }

    @Test
    @DisplayName("Should find transactions with payment URL")
    void testFindTransactionsWithPaymentUrl() {
        PaymentTransaction withUrl = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("WITH_URL")
                .requestType("captureWallet")
                .amount(50000000L)
                .payUrl("http://momo.vn/pay/123")
                .build();

        PaymentTransaction withoutUrl = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("WITHOUT_URL")
                .requestType("captureWallet")
                .amount(60000000L)
                .build();

        paymentTransactionRepository.save(withUrl);
        paymentTransactionRepository.save(withoutUrl);
        entityManager.flush();

        List<PaymentTransaction> result =
                paymentTransactionRepository.findTransactionsWithPaymentUrl();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPayUrl()).isNotEmpty();
    }

    @Test
    @DisplayName("Should count successful and failed transactions")
    void testCountTransactions() {
        PaymentTransaction success1 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("SUCCESS_1")
                .requestType("captureWallet")
                .amount(50000000L)
                .resultCode(0)
                .build();

        PaymentTransaction success2 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("SUCCESS_2")
                .requestType("captureWallet")
                .amount(60000000L)
                .resultCode(0)
                .build();

        PaymentTransaction failed1 = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("FAILED_1")
                .requestType("captureWallet")
                .amount(70000000L)
                .resultCode(1004)
                .build();

        paymentTransactionRepository.save(success1);
        paymentTransactionRepository.save(success2);
        paymentTransactionRepository.save(failed1);
        entityManager.flush();

        long successCount = paymentTransactionRepository.countSuccessfulTransactions();
        long failedCount = paymentTransactionRepository.countFailedTransactions();

        assertThat(successCount).isEqualTo(2);
        assertThat(failedCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should verify transaction helper methods")
    void testTransactionHelperMethods() {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentOrder(paymentOrder)
                .partnerCode("MOMO")
                .requestId("HELPER_TEST")
                .requestType("captureWallet")
                .amount(50000000L)
                .transId(999888777L)
                .payUrl("http://momo.vn/pay/123")
                .deeplink("momo://pay/123")
                .qrCodeUrl("http://momo.vn/qr/123")
                .resultCode(0)
                .build();

        assertThat(transaction.isSuccess()).isTrue();
        assertThat(transaction.hasMomoTransId()).isTrue();
        assertThat(transaction.hasPaymentUrl()).isTrue();
        assertThat(transaction.hasDeeplink()).isTrue();
        assertThat(transaction.hasQrCode()).isTrue();
    }
}
