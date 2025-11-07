package com.clinicbooking.clinic_booking_system.repository;

import com.clinicbooking.clinic_booking_system.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByConsultationIdOrderByCreatedAtAsc(Long consultationId, Pageable pageable);
    List<Message> findByConsultationIdAndIsReadFalse(Long consultationId);
    long countByConsultationIdAndIsReadFalse(Long consultationId);
}
