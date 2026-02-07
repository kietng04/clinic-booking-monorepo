package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.VoucherDto;
import com.clinicbooking.appointmentservice.entity.Voucher;
import com.clinicbooking.appointmentservice.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    private Voucher voucher;
    private VoucherDto voucherDto;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        voucher = Voucher.builder()
                .id(1L)
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

        voucherDto = new VoucherDto();
        voucherDto.setCode("SUMMER20");
        voucherDto.setDescription("Summer discount 20%");
        voucherDto.setDiscountPercentage(BigDecimal.valueOf(20));
        voucherDto.setMaxDiscount(BigDecimal.valueOf(100000));
        voucherDto.setMinPurchaseAmount(BigDecimal.valueOf(50000));
        voucherDto.setValidFrom(now.minusDays(10));
        voucherDto.setValidTo(now.plusDays(20));
        voucherDto.setUsageLimit(100);
        voucherDto.setIsActive(true);
    }

    @Test
    void testCreateVoucher_Success() {
        // Given
        when(voucherRepository.save(any())).thenReturn(voucher);

        // When
        VoucherDto result = voucherService.createVoucher(voucherDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("SUMMER20");
        verify(voucherRepository).save(any());
    }

    @Test
    void testGetVoucherById_Success() {
        // Given
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        // When
        VoucherDto result = voucherService.getVoucherById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("SUMMER20");
        verify(voucherRepository).findById(1L);
    }

    @Test
    void testGetVoucherById_NotFound() {
        // Given
        when(voucherRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> voucherService.getVoucherById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Voucher not found");
    }

    @Test
    void testGetVoucherByCode_Success() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When
        VoucherDto result = voucherService.getVoucherByCode("summer20");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("SUMMER20");
        verify(voucherRepository).findByCode("SUMMER20");
    }

    @Test
    void testGetVoucherByCode_NotFound() {
        // Given
        when(voucherRepository.findByCode(any())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> voucherService.getVoucherByCode("NONEXISTENT"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Voucher code not found");
    }

    @Test
    void testGetAllVouchers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Voucher> voucherPage = new PageImpl<>(List.of(voucher));
        when(voucherRepository.findAll(pageable)).thenReturn(voucherPage);

        // When
        Page<VoucherDto> result = voucherService.getAllVouchers(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(voucherRepository).findAll(pageable);
    }

    @Test
    void testGetActiveVouchers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Voucher> voucherPage = new PageImpl<>(List.of(voucher));
        when(voucherRepository.findActiveVouchers(any(), eq(pageable))).thenReturn(voucherPage);

        // When
        Page<VoucherDto> result = voucherService.getActiveVouchers(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(voucherRepository).findActiveVouchers(any(), eq(pageable));
    }

    @Test
    void testSearchVouchers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Voucher> voucherPage = new PageImpl<>(List.of(voucher));
        when(voucherRepository.searchVouchers("summer", pageable)).thenReturn(voucherPage);

        // When
        Page<VoucherDto> result = voucherService.searchVouchers("summer", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(voucherRepository).searchVouchers("summer", pageable);
    }

    @Test
    void testUpdateVoucher_Success() {
        // Given
        VoucherDto updateDto = new VoucherDto();
        updateDto.setDescription("Updated description");
        updateDto.setDiscountPercentage(BigDecimal.valueOf(25));

        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(voucherRepository.save(any())).thenReturn(voucher);

        // When
        VoucherDto result = voucherService.updateVoucher(1L, updateDto);

        // Then
        assertThat(result).isNotNull();
        verify(voucherRepository).findById(1L);
        verify(voucherRepository).save(any());
    }

    @Test
    void testUpdateVoucher_NotFound() {
        // Given
        when(voucherRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> voucherService.updateVoucher(999L, voucherDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Voucher not found");
    }

    @Test
    void testDeleteVoucher_Success() {
        // When
        voucherService.deleteVoucher(1L);

        // Then
        verify(voucherRepository).deleteById(1L);
    }

    @Test
    void testDeleteVoucher_NotFound() {
        // Note: deleteById does not throw exception if ID doesn't exist
        // This is expected Spring Data JPA behavior

        // When
        voucherService.deleteVoucher(999L);

        // Then
        verify(voucherRepository).deleteById(999L);
    }

    @Test
    void testValidateAndGetVoucher_Success() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When
        VoucherDto result = voucherService.validateAndGetVoucher("SUMMER20");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("SUMMER20");
    }

    @Test
    void testValidateAndGetVoucher_Inactive() {
        // Given
        voucher.setIsActive(false);
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When/Then
        assertThatThrownBy(() -> voucherService.validateAndGetVoucher("SUMMER20"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void testValidateAndGetVoucher_Expired() {
        // Given
        voucher.setValidTo(LocalDateTime.now().minusDays(1));
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When/Then
        assertThatThrownBy(() -> voucherService.validateAndGetVoucher("SUMMER20"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void testValidateAndGetVoucher_NotYetValid() {
        // Given
        voucher.setValidFrom(LocalDateTime.now().plusDays(5));
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When/Then
        assertThatThrownBy(() -> voucherService.validateAndGetVoucher("SUMMER20"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not yet valid");
    }

    @Test
    void testValidateAndGetVoucher_UsageLimitReached() {
        // Given
        voucher.setUsageLimit(10);
        voucher.setUsedCount(10);
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));

        // When/Then
        assertThatThrownBy(() -> voucherService.validateAndGetVoucher("SUMMER20"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("usage limit reached");
    }

    @Test
    void testCalculateDiscount_Success() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));
        BigDecimal amount = BigDecimal.valueOf(200000);

        // When
        BigDecimal discount = voucherService.calculateDiscount("SUMMER20", amount);

        // Then
        assertThat(discount).isEqualByComparingTo(BigDecimal.valueOf(40000)); // 20% of 200000
    }

    @Test
    void testCalculateDiscount_MaxDiscountLimit() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));
        BigDecimal amount = BigDecimal.valueOf(1000000); // Very large amount

        // When
        BigDecimal discount = voucherService.calculateDiscount("SUMMER20", amount);

        // Then
        assertThat(discount).isEqualByComparingTo(BigDecimal.valueOf(100000)); // Limited by maxDiscount
    }

    @Test
    void testCalculateDiscount_BelowMinimumPurchase() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));
        BigDecimal amount = BigDecimal.valueOf(30000); // Below minimum

        // When/Then
        assertThatThrownBy(() -> voucherService.calculateDiscount("SUMMER20", amount))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Minimum purchase amount");
    }

    @Test
    void testUseVoucher_Success() {
        // Given
        when(voucherRepository.findByCode("SUMMER20")).thenReturn(Optional.of(voucher));
        when(voucherRepository.save(any())).thenReturn(voucher);

        // When
        voucherService.useVoucher("SUMMER20");

        // Then
        verify(voucherRepository).save(argThat(v -> v.getUsedCount() == 11));
    }

    @Test
    void testUseVoucher_NotFound() {
        // Given
        when(voucherRepository.findByCode("NONEXISTENT")).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> voucherService.useVoucher("NONEXISTENT"))
                .isInstanceOf(RuntimeException.class);
    }
}
