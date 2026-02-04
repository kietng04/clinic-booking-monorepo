package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Voucher;
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
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    Page<Voucher> findByIsActiveTrueAndValidFromLessThanEqualAndValidToGreaterThanEqual(
        LocalDateTime now1, LocalDateTime now2, Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE " +
           "v.isActive = true AND " +
           "v.validFrom <= :now AND " +
           "v.validTo >= :now AND " +
           "(v.usageLimit = -1 OR v.usedCount < v.usageLimit)")
    Page<Voucher> findActiveVouchers(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE " +
           "LOWER(v.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Voucher> searchVouchers(@Param("searchTerm") String searchTerm, Pageable pageable);

    List<Voucher> findByIsActiveTrueAndValidToAfter(LocalDateTime now);
}
