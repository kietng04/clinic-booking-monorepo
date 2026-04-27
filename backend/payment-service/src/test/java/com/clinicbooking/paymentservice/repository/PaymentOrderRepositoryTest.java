package com.clinicbooking.paymentservice.repository;

import com.clinicbooking.paymentservice.entity.PaymentOrder;
import com.clinicbooking.paymentservice.enums.PaymentMethod;
import com.clinicbooking.paymentservice.enums.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("PaymentOrderRepository Tests")
class PaymentOrderRepositoryTest {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private TestEntityManager entityManager;

    private PaymentOrder testPaymentOrder;

    @BeforeEach
    void setUp() {
        testPaymentOrder = PaymentOrder.builder()
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
                .description("Appointment payment")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should save and find payment order by order ID")
    void testSaveAndFindByOrderId() {
        PaymentOrder saved = paymentOrderRepository.save(testPaymentOrder);
        entityManager.flush();

        Optional<PaymentOrder> found = paymentOrderRepository.findByOrderId("ORDER123456789");

        assertThat(found).isPresent();
        assertThat(found.get().getOrderId()).isEqualTo("ORDER123456789");
        assertThat(found.get().getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should find payment order by appointment ID")
    void testFindByAppointmentId() {
        paymentOrderRepository.save(testPaymentOrder);
        entityManager.flush();

        Optional<PaymentOrder> found = paymentOrderRepository.findByAppointmentId(1L);

        assertThat(found).isPresent();
        assertThat(found.get().getAppointmentId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should return latest payment order for appointment")
    void testFindTopByAppointmentIdOrderByCreatedAtDesc() {
        PaymentOrder olderOrder = paymentOrderRepository.save(testPaymentOrder);
        entityManager.flush();

        PaymentOrder latestOrder = PaymentOrder.builder()
                .orderId("ORDER-LATEST-1")
                .appointmentId(1L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("55000.00"))
                .currency("VND")
                .description("Latest payment")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.PENDING)
                .build();
        paymentOrderRepository.save(latestOrder);
        entityManager.flush();
        entityManager.clear();

        Optional<PaymentOrder> found = paymentOrderRepository.findTopByAppointmentIdOrderByCreatedAtDesc(1L);

        assertThat(found).isPresent();
        assertThat(found.get().getOrderId()).isEqualTo("ORDER-LATEST-1");
        assertThat(found.get().getOrderId()).isNotEqualTo(olderOrder.getOrderId());
    }

    @Test
    @DisplayName("Should find payment orders by patient ID with pagination")
    void testFindByPatientId() {
        paymentOrderRepository.save(testPaymentOrder);

        PaymentOrder order2 = PaymentOrder.builder()
                .orderId("ORDER987654321")
                .appointmentId(2L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("75000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();
        paymentOrderRepository.save(order2);
        entityManager.flush();

        Pageable pageable = PageRequest.of(0, 10);
        Page<PaymentOrder> result = paymentOrderRepository.findByPatientId(100L, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(PaymentOrder::getPatientId)
                .containsOnly(100L);
    }

    @Test
    @DisplayName("Should find payment orders by status")
    void testFindByStatus() {
        paymentOrderRepository.save(testPaymentOrder);

        PaymentOrder completed = PaymentOrder.builder()
                .orderId("ORDER999999999")
                .appointmentId(3L)
                .patientId(101L)
                .doctorId(200L)
                .patientName("Jane Smith")
                .patientEmail("jane@example.com")
                .patientPhone("0987654321")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("60000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();
        paymentOrderRepository.save(completed);
        entityManager.flush();

        List<PaymentOrder> pendingOrders = paymentOrderRepository.findByStatus(PaymentStatus.PENDING);
        List<PaymentOrder> completedOrders = paymentOrderRepository.findByStatus(PaymentStatus.COMPLETED);

        assertThat(pendingOrders).hasSize(1);
        assertThat(completedOrders).hasSize(1);
        assertThat(pendingOrders.get(0).getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(completedOrders.get(0).getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should find pending counter payments ordered by creation date")
    void testFindByStatusAndPaymentMethodInOrderByCreatedAtAsc() {
        PaymentOrder cashPayment = PaymentOrder.builder()
                .orderId("CASH001")
                .appointmentId(4L)
                .patientId(102L)
                .doctorId(200L)
                .patientName("Test Patient 1")
                .patientEmail("test1@example.com")
                .patientPhone("0111111111")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("30000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.CASH)
                .status(PaymentStatus.PENDING)
                .build();

        PaymentOrder bankTransfer = PaymentOrder.builder()
                .orderId("BANK001")
                .appointmentId(5L)
                .patientId(103L)
                .doctorId(200L)
                .patientName("Test Patient 2")
                .patientEmail("test2@example.com")
                .patientPhone("0222222222")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("40000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.PENDING)
                .build();

        paymentOrderRepository.save(cashPayment);
        paymentOrderRepository.save(bankTransfer);
        entityManager.flush();

        List<PaymentMethod> counterMethods = List.of(
                PaymentMethod.CASH,
                PaymentMethod.BANK_TRANSFER,
                PaymentMethod.CARD_AT_COUNTER
        );

        Pageable pageable = PageRequest.of(0, 10);
        Page<PaymentOrder> result = paymentOrderRepository.findByStatusAndPaymentMethodInOrderByCreatedAtAsc(
                PaymentStatus.PENDING, counterMethods, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(PaymentOrder::getPaymentMethod)
                .containsExactlyInAnyOrder(PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER);
    }

    @Test
    @DisplayName("Should check if payment exists for appointment")
    void testExistsByAppointmentId() {
        paymentOrderRepository.save(testPaymentOrder);
        entityManager.flush();

        boolean exists = paymentOrderRepository.existsByAppointmentId(1L);
        boolean notExists = paymentOrderRepository.existsByAppointmentId(999L);

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find expired orders")
    void testFindExpiredOrders() {
        PaymentOrder expiredOrder = PaymentOrder.builder()
                .orderId("EXPIRED001")
                .appointmentId(6L)
                .patientId(104L)
                .doctorId(200L)
                .patientName("Expired User")
                .patientEmail("expired@example.com")
                .patientPhone("0333333333")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("25000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.PENDING)
                .expiredAt(LocalDateTime.now().minusMinutes(5))
                .build();

        paymentOrderRepository.save(expiredOrder);
        entityManager.flush();

        List<PaymentOrder> expiredOrders = paymentOrderRepository.findExpiredOrders();

        assertThat(expiredOrders).hasSize(1);
        assertThat(expiredOrders.get(0).getOrderId()).isEqualTo("EXPIRED001");
    }

    @Test
    @DisplayName("Should calculate total revenue for completed orders")
    void testGetTotalRevenueForCompletedOrders() {
        PaymentOrder order1 = PaymentOrder.builder()
                .orderId("COMP001")
                .appointmentId(7L)
                .patientId(105L)
                .doctorId(200L)
                .patientName("Patient 1")
                .patientEmail("patient1@example.com")
                .patientPhone("0444444444")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("50000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();

        PaymentOrder order2 = PaymentOrder.builder()
                .orderId("COMP002")
                .appointmentId(8L)
                .patientId(106L)
                .doctorId(200L)
                .patientName("Patient 2")
                .patientEmail("patient2@example.com")
                .patientPhone("0555555555")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("75000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();

        paymentOrderRepository.save(order1);
        paymentOrderRepository.save(order2);
        entityManager.flush();

        BigDecimal totalRevenue = paymentOrderRepository.getTotalRevenueForCompletedOrders();

        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("125000.00"));
    }

    @Test
    @DisplayName("Should count payment orders by status")
    void testCountByPatientIdAndStatus() {
        paymentOrderRepository.save(testPaymentOrder);

        PaymentOrder order2 = PaymentOrder.builder()
                .orderId("ORDER777777777")
                .appointmentId(9L)
                .patientId(100L)
                .doctorId(200L)
                .patientName("John Doe")
                .patientEmail("john@example.com")
                .patientPhone("0123456789")
                .doctorName("Dr. Smith")
                .amount(new BigDecimal("80000.00"))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOMO_WALLET)
                .status(PaymentStatus.COMPLETED)
                .build();
        paymentOrderRepository.save(order2);
        entityManager.flush();

        long pendingCount = paymentOrderRepository.countByPatientIdAndStatus(100L, PaymentStatus.PENDING);
        long completedCount = paymentOrderRepository.countByPatientIdAndStatus(100L, PaymentStatus.COMPLETED);

        assertThat(pendingCount).isEqualTo(1);
        assertThat(completedCount).isEqualTo(1);
    }

    // Note: Pessimistic locking test disabled for H2 database
    // H2 doesn't support PostgreSQL's FOR NO KEY UPDATE syntax
    // This query is tested in production with PostgreSQL
}
