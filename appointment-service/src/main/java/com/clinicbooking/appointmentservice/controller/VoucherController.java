package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.VoucherDto;
import com.clinicbooking.appointmentservice.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Voucher Management", description = "Manage discount vouchers and promotional codes")
public class VoucherController {
    private final VoucherService voucherService;

    @PostMapping
    @Operation(summary = "Create a new voucher", description = "Admin only: Create a new discount voucher")
    public ResponseEntity<VoucherDto> createVoucher(@RequestBody VoucherDto dto) {
        VoucherDto createdVoucher = voucherService.createVoucher(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVoucher);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get voucher by ID")
    public ResponseEntity<VoucherDto> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get voucher by code")
    public ResponseEntity<VoucherDto> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }

    @GetMapping
    @Operation(summary = "Get all vouchers", description = "Admin only: List all vouchers with pagination")
    public ResponseEntity<Page<VoucherDto>> getAllVouchers(Pageable pageable) {
        return ResponseEntity.ok(voucherService.getAllVouchers(pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active vouchers")
    public ResponseEntity<Page<VoucherDto>> getActiveVouchers(Pageable pageable) {
        return ResponseEntity.ok(voucherService.getActiveVouchers(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search vouchers by code or description")
    public ResponseEntity<Page<VoucherDto>> searchVouchers(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(voucherService.searchVouchers(query, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update voucher", description = "Admin only: Update an existing voucher")
    public ResponseEntity<VoucherDto> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherDto dto) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete voucher", description = "Admin only: Delete a voucher")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate/{code}")
    @Operation(summary = "Validate voucher code")
    public ResponseEntity<VoucherDto> validateVoucher(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.validateAndGetVoucher(code));
    }

    @PostMapping("/calculate-discount/{code}")
    @Operation(summary = "Calculate discount amount for a voucher code")
    public ResponseEntity<Map<String, Object>> calculateDiscount(
            @PathVariable String code,
            @RequestParam BigDecimal amount) {
        BigDecimal discount = voucherService.calculateDiscount(code, amount);
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("originalAmount", amount);
        response.put("discountAmount", discount);
        response.put("finalAmount", amount.subtract(discount));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/use/{code}")
    @Operation(summary = "Use a voucher code (increment usage count)")
    public ResponseEntity<Map<String, String>> useVoucher(@PathVariable String code) {
        voucherService.useVoucher(code);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Voucher used successfully");
        response.put("code", code);
        return ResponseEntity.ok(response);
    }
}
