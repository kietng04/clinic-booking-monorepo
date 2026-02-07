package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Voucher;
import org.junit.jupiter.api.BeforeEach;
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
class VoucherRepositoryTest {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Voucher voucher1;
    private Voucher voucher2;
    private Voucher voucher3;

    @BeforeEach
    void setUp() {
        // Clear all vouchers
        voucherRepository.deleteAll();

        // Create test vouchers
        LocalDateTime now = LocalDateTime.now();

        voucher1 = Voucher.builder()
                .code("SUMMER20")
                .description("Summer discount 20%")
                .discountPercentage(BigDecimal.valueOf(20))
                .maxDiscount(BigDecimal.valueOf(100000))
                .minPurchaseAmount(BigDecimal.valueOf(50000))
                .validFrom(now.minusDays(10))
                .validTo(now.plusDays(20))
                .usageLimit(100)
                .usedCount(10)
                .isActive(true)
                .build();

        voucher2 = Voucher.builder()
                .code("NEWYEAR50")
                .description("New Year special 50% off")
                .discountPercentage(BigDecimal.valueOf(50))
                .maxDiscount(BigDecimal.valueOf(200000))
                .minPurchaseAmount(BigDecimal.valueOf(100000))
                .validFrom(now.minusDays(5))
                .validTo(now.plusDays(5))
                .usageLimit(-1) // Unlimited
                .usedCount(50)
                .isActive(true)
                .build();

        voucher3 = Voucher.builder()
                .code("EXPIRED10")
                .description("Expired discount")
                .discountPercentage(BigDecimal.valueOf(10))
                .maxDiscount(BigDecimal.valueOf(50000))
                .minPurchaseAmount(BigDecimal.valueOf(30000))
                .validFrom(now.minusDays(30))
                .validTo(now.minusDays(5))
                .usageLimit(50)
                .usedCount(0)
                .isActive(false)
                .build();

        voucher1 = entityManager.persistAndFlush(voucher1);
        voucher2 = entityManager.persistAndFlush(voucher2);
        voucher3 = entityManager.persistAndFlush(voucher3);
    }

    @Test
    void testFindByCode() {
        // When
        Optional<Voucher> result = voucherRepository.findByCode("SUMMER20");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("SUMMER20");
        assertThat(result.get().getDiscountPercentage()).isEqualByComparingTo(BigDecimal.valueOf(20));
    }

    @Test
    void testFindByCode_NotFound() {
        // When
        Optional<Voucher> result = voucherRepository.findByCode("NONEXISTENT");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testFindActiveVouchers() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Voucher> result = voucherRepository.findActiveVouchers(now, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Voucher::getCode)
                .contains("SUMMER20", "NEWYEAR50");
    }

    @Test
    void testFindByIsActiveTrueAndValidFromLessThanEqualAndValidToGreaterThanEqual() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Voucher> result = voucherRepository
                .findByIsActiveTrueAndValidFromLessThanEqualAndValidToGreaterThanEqual(
                        now, now, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void testSearchVouchers_ByCode() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Voucher> result = voucherRepository.searchVouchers("summer", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("SUMMER20");
    }

    @Test
    void testSearchVouchers_ByDescription() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Voucher> result = voucherRepository.searchVouchers("special", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("NEWYEAR50");
    }

    @Test
    void testSearchVouchers_CaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Voucher> result = voucherRepository.searchVouchers("SUMMER", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void testFindByIsActiveTrueAndValidToAfter() {
        // Given
        LocalDateTime now = LocalDateTime.now();

        // When
        List<Voucher> result = voucherRepository.findByIsActiveTrueAndValidToAfter(now);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Voucher::getCode)
                .contains("SUMMER20", "NEWYEAR50");
    }

    @Test
    void testSaveAndFindById() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        Voucher newVoucher = Voucher.builder()
                .code("TEST30")
                .description("Test voucher 30% off")
                .discountPercentage(BigDecimal.valueOf(30))
                .maxDiscount(BigDecimal.valueOf(150000))
                .minPurchaseAmount(BigDecimal.valueOf(75000))
                .validFrom(now)
                .validTo(now.plusDays(30))
                .usageLimit(200)
                .usedCount(0)
                .isActive(true)
                .build();

        // When
        Voucher saved = voucherRepository.save(newVoucher);
        Voucher found = voucherRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getCode()).isEqualTo("TEST30");
        assertThat(found.getDiscountPercentage()).isEqualByComparingTo(BigDecimal.valueOf(30));
    }

    @Test
    void testUpdateVoucher() {
        // Given
        Voucher voucher = voucher1;
        String newDescription = "Updated summer discount";
        BigDecimal newDiscount = BigDecimal.valueOf(25);

        // When
        voucher.setDescription(newDescription);
        voucher.setDiscountPercentage(newDiscount);
        Voucher updated = voucherRepository.save(voucher);

        // Then
        assertThat(updated.getDescription()).isEqualTo(newDescription);
        assertThat(updated.getDiscountPercentage()).isEqualByComparingTo(newDiscount);

        // Verify in database
        Voucher found = voucherRepository.findById(voucher.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getDescription()).isEqualTo(newDescription);
        assertThat(found.getDiscountPercentage()).isEqualByComparingTo(newDiscount);
    }

    @Test
    void testIncrementUsedCount() {
        // Given
        Voucher voucher = voucher1;
        Integer initialUsedCount = voucher.getUsedCount();

        // When
        voucher.setUsedCount(initialUsedCount + 1);
        Voucher updated = voucherRepository.save(voucher);

        // Then
        assertThat(updated.getUsedCount()).isEqualTo(initialUsedCount + 1);
    }

    @Test
    void testVoucherIsExpired() {
        // When
        boolean expired = voucher3.isExpired();

        // Then
        assertThat(expired).isTrue();
    }

    @Test
    void testVoucherIsNotExpired() {
        // When
        boolean expired = voucher1.isExpired();

        // Then
        assertThat(expired).isFalse();
    }

    @Test
    void testVoucherCanBeUsed_Valid() {
        // When
        boolean canBeUsed = voucher1.canBeUsed();

        // Then
        assertThat(canBeUsed).isTrue();
    }

    @Test
    void testVoucherCanBeUsed_Inactive() {
        // When
        boolean canBeUsed = voucher3.canBeUsed();

        // Then
        assertThat(canBeUsed).isFalse();
    }

    @Test
    void testVoucherCanBeUsed_UsageLimitReached() {
        // Given
        voucher1.setUsageLimit(10);
        voucher1.setUsedCount(10);
        voucherRepository.save(voucher1);

        // When
        boolean canBeUsed = voucher1.canBeUsed();

        // Then
        assertThat(canBeUsed).isFalse();
    }

    @Test
    void testVoucherCanBeUsed_UnlimitedUsage() {
        // When
        boolean canBeUsed = voucher2.canBeUsed();

        // Then
        assertThat(canBeUsed).isTrue(); // usageLimit = -1 means unlimited
    }

    @Test
    void testDeleteVoucher() {
        // Given
        Long voucherId = voucher1.getId();

        // When
        voucherRepository.deleteById(voucherId);
        boolean exists = voucherRepository.existsById(voucherId);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testFindAll() {
        // When
        List<Voucher> result = voucherRepository.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    void testUniqueCodeConstraint() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        Voucher duplicateVoucher = Voucher.builder()
                .code("SUMMER20") // Duplicate code
                .description("Duplicate")
                .discountPercentage(BigDecimal.valueOf(15))
                .maxDiscount(BigDecimal.valueOf(75000))
                .minPurchaseAmount(BigDecimal.valueOf(40000))
                .validFrom(now)
                .validTo(now.plusDays(10))
                .usageLimit(50)
                .usedCount(0)
                .isActive(true)
                .build();

        // When/Then
        try {
            voucherRepository.saveAndFlush(duplicateVoucher);
            assertThat(false).isTrue(); // Should not reach here
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }
}
