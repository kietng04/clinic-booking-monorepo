package com.clinicbooking.consultationservice.service;

import com.clinicbooking.consultationservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for consultation operations
 */
public interface ConsultationService {

    /**
     * Create a new consultation request
     */
    ConsultationResponseDto createConsultation(ConsultationRequestDto request, Long patientId);

    /**
     * Get consultation by ID
     */
    ConsultationResponseDto getConsultationById(Long id, Long userId);

    /**
     * Get consultations for a patient
     */
    Page<ConsultationSummaryDto> getConsultationsByPatient(Long patientId, Pageable pageable);

    /**
     * Get consultations for a doctor
     */
    Page<ConsultationSummaryDto> getConsultationsByDoctor(Long doctorId, Pageable pageable);

    /**
     * Get pending consultations for a doctor
     */
    List<ConsultationSummaryDto> getPendingConsultationsByDoctor(Long doctorId);

    /**
     * Get active consultations for a doctor
     */
    List<ConsultationSummaryDto> getActiveConsultationsByDoctor(Long doctorId);

    /**
     * Get active consultations for a patient
     */
    List<ConsultationSummaryDto> getActiveConsultationsByPatient(Long patientId);

    /**
     * Doctor accepts a consultation request
     */
    ConsultationResponseDto acceptConsultation(Long consultationId, Long doctorId);

    /**
     * Doctor rejects a consultation request
     */
    ConsultationResponseDto rejectConsultation(Long consultationId, Long doctorId, RejectConsultationRequestDto request);

    /**
     * Start a consultation (first message sent)
     */
    ConsultationResponseDto startConsultation(Long consultationId);

    /**
     * Complete a consultation
     */
    ConsultationResponseDto completeConsultation(Long consultationId, Long doctorId, CompleteConsultationRequestDto request);

    /**
     * Cancel a consultation (by patient)
     */
    ConsultationResponseDto cancelConsultation(Long consultationId, Long patientId);

    /**
     * Get total unread consultation count for a user
     */
    Long getTotalUnreadCount(Long userId);
}
