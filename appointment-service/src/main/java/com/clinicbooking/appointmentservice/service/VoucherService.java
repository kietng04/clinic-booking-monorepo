package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.VoucherDto;
import com.clinicbooking.appointmentservice.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface VoucherService {
    VoucherDto createVoucher(VoucherDto dto);
    VoucherDto getVoucherById(Long id);
    VoucherDto getVoucherByCode(String code);
    Page<VoucherDto> getAllVouchers(Pageable pageable);
    Page<VoucherDto> getActiveVouchers(Pageable pageable);
    Page<VoucherDto> searchVouchers(String searchTerm, Pageable pageable);
    VoucherDto updateVoucher(Long id, VoucherDto dto);
    void deleteVoucher(Long id);
    VoucherDto validateAndGetVoucher(String code);
    BigDecimal calculateDiscount(String code, BigDecimal amount);
    void useVoucher(String code);
}
