package com.clinicbooking.consultationservice.service;

import com.clinicbooking.consultationservice.client.UserServiceClient;
import com.clinicbooking.consultationservice.dto.*;
import com.clinicbooking.consultationservice.entity.Consultation;
import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import com.clinicbooking.consultationservice.entity.Message;
import com.clinicbooking.consultationservice.exception.ResourceNotFoundException;
import com.clinicbooking.consultationservice.exception.UnauthorizedException;
import com.clinicbooking.consultationservice.repository.ConsultationRepository;
import com.clinicbooking.consultationservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ConsultationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final MessageRepository messageRepository;
    private final UserServiceClient userServiceClient;

    @Value("${consultation.default-fee:200000}")
    private BigDecimal defaultFee;

    @Override
    @Transactional
    public ConsultationResponseDto createConsultation(ConsultationRequestDto request, Long patientId) {
        log.info("Creating consultation request for patient {} with doctor {}", patientId, request.getDoctorId());

        // Fetch user information
        UserInfoDto patient = userServiceClient.getUserById(patientId);
        UserInfoDto doctor = userServiceClient.getDoctorById(request.getDoctorId());

        if (doctor == null || !Boolean.TRUE.equals(doctor.getIsActive())) {
            throw new IllegalArgumentException("Doctor is not active");
        }

        // Create consultation entity
        Consultation consultation = Consultation.builder()
                .patientId(patientId)
                .patientName(patient.getFullName())
                .doctorId(request.getDoctorId())
                .doctorName(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .topic(request.getTopic())
                .description(request.getDescription())
                .status(ConsultationStatus.PENDING)
                .fee(request.getFee() != null ? request.getFee() : defaultFee)
                .isPaid(false)
                .build();

        consultation = consultationRepository.save(consultation);
        log.info("Consultation created with ID: {}", consultation.getId());

        // TODO: Send notification to doctor via Kafka

        return mapToResponseDto(consultation, patientId);
    }

    @Override
    public ConsultationResponseDto getConsultationById(Long id, Long userId) {
        log.info("Fetching consultation {} for user {}", id, userId);

        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + id));

        // Verify user has access to this consultation
        if (!consultation.getPatientId().equals(userId) && !consultation.getDoctorId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this consultation");
        }

        return mapToResponseDto(consultation, userId);
    }

    @Override
    public Page<ConsultationSummaryDto> getConsultationsByPatient(Long patientId, Pageable pageable) {
        log.info("Fetching consultations for patient {}", patientId);

        Page<Consultation> consultations = consultationRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId, pageable);

        return consultations.map(c -> mapToSummaryDto(c, patientId));
    }

    @Override
    public Page<ConsultationSummaryDto> getConsultationsByDoctor(Long doctorId, Pageable pageable) {
        log.info("Fetching consultations for doctor {}", doctorId);

        Page<Consultation> consultations = consultationRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId, pageable);

        return consultations.map(c -> mapToSummaryDto(c, doctorId));
    }

    @Override
    public List<ConsultationSummaryDto> getPendingConsultationsByDoctor(Long doctorId) {
        log.info("Fetching pending consultations for doctor {}", doctorId);

        List<Consultation> consultations = consultationRepository
                .findPendingConsultationsByDoctor(doctorId);

        return consultations.stream()
                .map(c -> mapToSummaryDto(c, doctorId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConsultationSummaryDto> getActiveConsultationsByDoctor(Long doctorId) {
        log.info("Fetching active consultations for doctor {}", doctorId);

        List<Consultation> consultations = consultationRepository
                .findActiveConsultationsByDoctor(doctorId);

        return consultations.stream()
                .map(c -> mapToSummaryDto(c, doctorId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConsultationSummaryDto> getActiveConsultationsByPatient(Long patientId) {
        log.info("Fetching active consultations for patient {}", patientId);

        List<Consultation> consultations = consultationRepository
                .findActiveConsultationsByPatient(patientId);

        return consultations.stream()
                .map(c -> mapToSummaryDto(c, patientId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConsultationResponseDto acceptConsultation(Long consultationId, Long doctorId) {
        log.info("Doctor {} accepting consultation {}", doctorId, consultationId);

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        // Verify doctor owns this consultation
        if (!consultation.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("You don't have permission to accept this consultation");
        }

        // Verify status is PENDING
        if (consultation.getStatus() != ConsultationStatus.PENDING) {
            throw new IllegalStateException("Consultation is not in PENDING status");
        }

        consultation.setStatus(ConsultationStatus.ACCEPTED);
        consultation.setAcceptedAt(LocalDateTime.now());
        consultation = consultationRepository.save(consultation);

        log.info("Consultation {} accepted by doctor {}", consultationId, doctorId);

        // TODO: Send notification to patient via Kafka

        return mapToResponseDto(consultation, doctorId);
    }

    @Override
    @Transactional
    public ConsultationResponseDto rejectConsultation(Long consultationId, Long doctorId,
                                                     RejectConsultationRequestDto request) {
        log.info("Doctor {} rejecting consultation {}", doctorId, consultationId);

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        // Verify doctor owns this consultation
        if (!consultation.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("You don't have permission to reject this consultation");
        }

        // Verify status is PENDING
        if (consultation.getStatus() != ConsultationStatus.PENDING) {
            throw new IllegalStateException("Consultation is not in PENDING status");
        }

        consultation.setStatus(ConsultationStatus.REJECTED);
        consultation.setRejectionReason(request.getReason());
        consultation = consultationRepository.save(consultation);

        log.info("Consultation {} rejected by doctor {}", consultationId, doctorId);

        // TODO: Send notification to patient via Kafka

        return mapToResponseDto(consultation, doctorId);
    }

    @Override
    @Transactional
    public ConsultationResponseDto startConsultation(Long consultationId) {
        log.info("Starting consultation {}", consultationId);

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (consultation.getStatus() == ConsultationStatus.ACCEPTED &&
            consultation.getStartedAt() == null) {
            consultation.setStatus(ConsultationStatus.IN_PROGRESS);
            consultation.setStartedAt(LocalDateTime.now());
            consultation = consultationRepository.save(consultation);

            log.info("Consultation {} started", consultationId);
        }

        return mapToResponseDto(consultation, consultation.getPatientId());
    }

    @Override
    @Transactional
    public ConsultationResponseDto completeConsultation(Long consultationId, Long doctorId,
                                                       CompleteConsultationRequestDto request) {
        log.info("Doctor {} completing consultation {}", doctorId, consultationId);

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        // Verify doctor owns this consultation
        if (!consultation.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("You don't have permission to complete this consultation");
        }

        // Verify status is IN_PROGRESS or ACCEPTED
        if (consultation.getStatus() != ConsultationStatus.IN_PROGRESS &&
            consultation.getStatus() != ConsultationStatus.ACCEPTED) {
            throw new IllegalStateException("Consultation is not in progress");
        }

        consultation.setStatus(ConsultationStatus.COMPLETED);
        consultation.setCompletedAt(LocalDateTime.now());
        consultation.setDoctorNotes(request.getDoctorNotes());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setPrescription(request.getPrescription());
        consultation = consultationRepository.save(consultation);

        log.info("Consultation {} completed by doctor {}", consultationId, doctorId);

        // TODO: Send notification to patient via Kafka

        return mapToResponseDto(consultation, doctorId);
    }

    @Override
    @Transactional
    public ConsultationResponseDto cancelConsultation(Long consultationId, Long patientId) {
        log.info("Patient {} cancelling consultation {}", patientId, consultationId);

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        // Verify patient owns this consultation
        if (!consultation.getPatientId().equals(patientId)) {
            throw new UnauthorizedException("You don't have permission to cancel this consultation");
        }

        // Can only cancel if PENDING or ACCEPTED
        if (consultation.getStatus() != ConsultationStatus.PENDING &&
            consultation.getStatus() != ConsultationStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot cancel consultation in current status");
        }

        consultation.setStatus(ConsultationStatus.CANCELLED);
        consultation = consultationRepository.save(consultation);

        log.info("Consultation {} cancelled by patient {}", consultationId, patientId);

        // TODO: Send notification to doctor via Kafka

        return mapToResponseDto(consultation, patientId);
    }

    @Override
    public Long getTotalUnreadCount(Long userId) {
        return messageRepository.countTotalUnreadMessagesByUser(userId);
    }

    // Helper methods for DTO mapping
    private ConsultationResponseDto mapToResponseDto(Consultation consultation, Long userId) {
        Long unreadCount = messageRepository.countUnreadMessages(consultation.getId(), userId);
        Message latestMessage = messageRepository.findLatestMessage(consultation.getId());

        return ConsultationResponseDto.builder()
                .id(consultation.getId())
                .patientId(consultation.getPatientId())
                .patientName(consultation.getPatientName())
                .doctorId(consultation.getDoctorId())
                .doctorName(consultation.getDoctorName())
                .specialization(consultation.getSpecialization())
                .topic(consultation.getTopic())
                .description(consultation.getDescription())
                .status(consultation.getStatus())
                .fee(consultation.getFee())
                .isPaid(consultation.getIsPaid())
                .paymentId(consultation.getPaymentId())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .acceptedAt(consultation.getAcceptedAt())
                .startedAt(consultation.getStartedAt())
                .completedAt(consultation.getCompletedAt())
                .rejectionReason(consultation.getRejectionReason())
                .doctorNotes(consultation.getDoctorNotes())
                .diagnosis(consultation.getDiagnosis())
                .prescription(consultation.getPrescription())
                .rating(consultation.getRating())
                .review(consultation.getReview())
                .unreadCount(unreadCount)
                .latestMessage(latestMessage != null ? mapToMessageDto(latestMessage) : null)
                .build();
    }

    private ConsultationSummaryDto mapToSummaryDto(Consultation consultation, Long userId) {
        Long unreadCount = messageRepository.countUnreadMessages(consultation.getId(), userId);
        Message latestMessage = messageRepository.findLatestMessage(consultation.getId());

        return ConsultationSummaryDto.builder()
                .id(consultation.getId())
                .patientId(consultation.getPatientId())
                .patientName(consultation.getPatientName())
                .doctorId(consultation.getDoctorId())
                .doctorName(consultation.getDoctorName())
                .specialization(consultation.getSpecialization())
                .topic(consultation.getTopic())
                .status(consultation.getStatus())
                .fee(consultation.getFee())
                .isPaid(consultation.getIsPaid())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .unreadCount(unreadCount)
                .latestMessagePreview(latestMessage != null ?
                        truncateMessage(latestMessage.getContent(), 50) : null)
                .latestMessageTime(latestMessage != null ? latestMessage.getSentAt() : null)
                .build();
    }

    private MessageDto mapToMessageDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .consultationId(message.getConsultationId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderRole(message.getSenderRole())
                .type(message.getType())
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileMimeType(message.getFileMimeType())
                .sentAt(message.getSentAt())
                .isRead(message.getIsRead())
                .readAt(message.getReadAt())
                .build();
    }

    private String truncateMessage(String content, int maxLength) {
        if (content == null) return null;
        if (content.length() <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    }
}
