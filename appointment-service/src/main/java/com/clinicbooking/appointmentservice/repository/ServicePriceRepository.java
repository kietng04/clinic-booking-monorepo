package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, Long> {
    List<ServicePrice> findByServiceId(Long serviceId);

    @Query("SELECT sp FROM ServicePrice sp WHERE sp.serviceId = :serviceId " +
            "AND (sp.doctorId = :doctorId OR sp.doctorId IS NULL) " +
            "AND (:date BETWEEN sp.effectiveFrom AND sp.effectiveTo OR sp.effectiveFrom IS NULL) " +
            "ORDER BY sp.doctorId DESC NULLS LAST")
    Optional<ServicePrice> findCurrentPrice(@Param("serviceId") Long serviceId,
                                            @Param("doctorId") Long doctorId,
                                            @Param("date") LocalDate date);
}
