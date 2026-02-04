package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.VoucherDto;
import com.clinicbooking.appointmentservice.entity.Voucher;
import com.clinicbooking.appointmentservice.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository voucherRepository;

    @Override
    @CacheEvict(value = "vouchers", allEntries = true)
    public VoucherDto createVoucher(VoucherDto dto) {
        Voucher voucher = Voucher.builder()
            .code(dto.getCode().toUpperCase())
            .description(dto.getDescription())
            .discountPercentage(dto.getDiscountPercentage())
            .maxDiscount(dto.getMaxDiscount())
            .minPurchaseAmount(dto.getMinPurchaseAmount())
            .validFrom(dto.getValidFrom())
            .validTo(dto.getValidTo())
            .usageLimit(dto.getUsageLimit())
            .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
            .build();

        voucher = voucherRepository.save(voucher);
        log.info("Created voucher: {}", voucher.getCode());
        return mapToDto(voucher);
    }

    @Override
    @Cacheable(value = "voucher", key = "#id")
    public VoucherDto getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found: " + id));
        return mapToDto(voucher);
    }

    @Override
    @Cacheable(value = "voucher", key = "#code")
    public VoucherDto getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new RuntimeException("Voucher code not found: " + code));
        return mapToDto(voucher);
    }

    @Override
    @Cacheable(value = "vouchers")
    public Page<VoucherDto> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Cacheable(value = "active_vouchers")
    public Page<VoucherDto> getActiveVouchers(Pageable pageable) {
        return voucherRepository.findActiveVouchers(LocalDateTime.now(), pageable).map(this::mapToDto);
    }

    @Override
    @Cacheable(value = "voucher_search", key = "#searchTerm")
    public Page<VoucherDto> searchVouchers(String searchTerm, Pageable pageable) {
        return voucherRepository.searchVouchers(searchTerm, pageable).map(this::mapToDto);
    }

    @Override
    @CacheEvict(value = {"vouchers", "voucher"}, allEntries = true)
    public VoucherDto updateVoucher(Long id, VoucherDto dto) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Voucher not found: " + id));

        if (dto.getDescription() != null) voucher.setDescription(dto.getDescription());
        if (dto.getDiscountPercentage() != null) voucher.setDiscountPercentage(dto.getDiscountPercentage());
        if (dto.getMaxDiscount() != null) voucher.setMaxDiscount(dto.getMaxDiscount());
        if (dto.getMinPurchaseAmount() != null) voucher.setMinPurchaseAmount(dto.getMinPurchaseAmount());
        if (dto.getValidFrom() != null) voucher.setValidFrom(dto.getValidFrom());
        if (dto.getValidTo() != null) voucher.setValidTo(dto.getValidTo());
        if (dto.getUsageLimit() != null) voucher.setUsageLimit(dto.getUsageLimit());
        if (dto.getIsActive() != null) voucher.setIsActive(dto.getIsActive());

        voucher = voucherRepository.save(voucher);
        log.info("Updated voucher: {}", voucher.getCode());
        return mapToDto(voucher);
    }

    @Override
    @CacheEvict(value = {"vouchers", "voucher"}, allEntries = true)
    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
        log.info("Deleted voucher: {}", id);
    }

    @Override
    public VoucherDto validateAndGetVoucher(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new RuntimeException("Voucher code not found: " + code));

        if (!voucher.canBeUsed()) {
            throw new RuntimeException("Voucher cannot be used: " + code +
                (voucher.isExpired() ? " (expired)" :
                 voucher.isNotYetValid() ? " (not yet valid)" :
                 !voucher.getIsActive() ? " (inactive)" : " (usage limit reached)"));
        }

        return mapToDto(voucher);
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal amount) {
        VoucherDto voucherDto = validateAndGetVoucher(code);

        if (amount.compareTo(voucherDto.getMinPurchaseAmount()) < 0) {
            throw new RuntimeException("Minimum purchase amount not met for voucher: " + code);
        }

        // Calculate discount: amount * (discountPercentage / 100)
        BigDecimal discount = amount.multiply(voucherDto.getDiscountPercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Cap discount at maxDiscount
        if (discount.compareTo(voucherDto.getMaxDiscount()) > 0) {
            discount = voucherDto.getMaxDiscount();
        }

        return discount;
    }

    @Override
    @CacheEvict(value = "voucher", key = "#code")
    public void useVoucher(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new RuntimeException("Voucher not found: " + code));

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
        log.info("Used voucher: {} (count: {})", code, voucher.getUsedCount());
    }

    private VoucherDto mapToDto(Voucher voucher) {
        return VoucherDto.builder()
            .id(voucher.getId())
            .code(voucher.getCode())
            .description(voucher.getDescription())
            .discountPercentage(voucher.getDiscountPercentage())
            .maxDiscount(voucher.getMaxDiscount())
            .minPurchaseAmount(voucher.getMinPurchaseAmount())
            .validFrom(voucher.getValidFrom())
            .validTo(voucher.getValidTo())
            .usageLimit(voucher.getUsageLimit())
            .usedCount(voucher.getUsedCount())
            .isActive(voucher.getIsActive())
            .canBeUsed(voucher.canBeUsed())
            .createdAt(voucher.getCreatedAt())
            .updatedAt(voucher.getUpdatedAt())
            .build();
    }
}
