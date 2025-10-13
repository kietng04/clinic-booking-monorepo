package com.clinicbooking.consultationservice.service;

import com.clinicbooking.consultationservice.client.UserServiceClient;
import com.clinicbooking.consultationservice.dto.MessageDto;
import com.clinicbooking.consultationservice.dto.SendMessageRequestDto;
import com.clinicbooking.consultationservice.dto.UserInfoDto;
import com.clinicbooking.consultationservice.entity.Consultation;
import com.clinicbooking.consultationservice.entity.ConsultationStatus;
import com.clinicbooking.consultationservice.entity.Message;
import com.clinicbooking.consultationservice.entity.MessageType;
import com.clinicbooking.consultationservice.exception.ResourceNotFoundException;
import com.clinicbooking.consultationservice.exception.UnauthorizedException;
import com.clinicbooking.consultationservice.repository.ConsultationRepository;
import com.clinicbooking.consultationservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of MessageService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConsultationRepository consultationRepository;
    private final UserServiceClient userServiceClient;
    private final ConsultationService consultationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageDto sendMessage(SendMessageRequestDto request, Long senderId, String senderRole) {
        log.info("User {} sending message to consultation {}", senderId, request.getConsultationId());

        // Verify consultation exists and user has access
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        // Verify user is part of this consultation
        if (!consultation.getPatientId().equals(senderId) && !consultation.getDoctorId().equals(senderId)) {
            throw new UnauthorizedException("You don't have access to this consultation");
        }

        // Verify consultation is in valid status for messaging
        if (consultation.getStatus() != ConsultationStatus.ACCEPTED &&
            consultation.getStatus() != ConsultationStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot send messages in current consultation status");
        }

        // Get sender information
        UserInfoDto sender = userServiceClient.getUserById(senderId);

        // Create message entity
        Message message = Message.builder()
                .consultationId(request.getConsultationId())
                .senderId(senderId)
                .senderName(sender.getFullName())
                .senderRole(senderRole)
                .type(request.getType() != null ? request.getType() : MessageType.TEXT)
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .fileMimeType(request.getFileMimeType())
                .isRead(false)
                .isDeleted(false)
                .build();

        message = messageRepository.save(message);
        log.info("Message {} saved for consultation {}", message.getId(), request.getConsultationId());

        // Start consultation if this is the first message
        if (consultation.getStatus() == ConsultationStatus.ACCEPTED) {
            consultationService.startConsultation(request.getConsultationId());
        }

        // Convert to DTO
        MessageDto messageDto = mapToDto(message);

        // Send via WebSocket to the consultation room
        messagingTemplate.convertAndSend(
                "/topic/consultation/" + request.getConsultationId(),
                messageDto
        );

        log.info("Message broadcast via WebSocket to consultation {}", request.getConsultationId());

        // TODO: Send push notification to recipient via Kafka

        return messageDto;
    }

    @Override
    public List<MessageDto> getMessagesByConsultation(Long consultationId, Long userId) {
        log.info("Fetching messages for consultation {} by user {}", consultationId, userId);

        // Verify user has access to this consultation
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (!consultation.getPatientId().equals(userId) && !consultation.getDoctorId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this consultation");
        }

        List<Message> messages = messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(consultationId);

        return messages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<MessageDto> getMessagesByConsultationPaginated(Long consultationId, Long userId, Pageable pageable) {
        log.info("Fetching paginated messages for consultation {} by user {}", consultationId, userId);

        // Verify user has access
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (!consultation.getPatientId().equals(userId) && !consultation.getDoctorId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this consultation");
        }

        Page<Message> messages = messageRepository
                .findByConsultationIdAndIsDeletedFalseOrderBySentAtDesc(consultationId, pageable);

        return messages.map(this::mapToDto);
    }

    @Override
    public List<MessageDto> getUnreadMessages(Long consultationId, Long userId) {
        log.info("Fetching unread messages for consultation {} by user {}", consultationId, userId);

        List<Message> messages = messageRepository.findUnreadMessages(consultationId, userId);

        return messages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long consultationId, Long userId) {
        log.info("Marking messages as read for consultation {} by user {}", consultationId, userId);

        int updatedCount = messageRepository.markMessagesAsRead(consultationId, userId, LocalDateTime.now());
        log.info("Marked {} messages as read", updatedCount);

        // Notify via WebSocket that messages were read
        messagingTemplate.convertAndSend(
                "/topic/consultation/" + consultationId + "/read",
                Map.of("userId", userId, "timestamp", LocalDateTime.now())
        );
    }

    @Override
    public Long countUnreadMessages(Long consultationId, Long userId) {
        return messageRepository.countUnreadMessages(consultationId, userId);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long senderId) {
        log.info("User {} deleting message {}", senderId, messageId);

        int deletedCount = messageRepository.softDeleteMessage(messageId, senderId, LocalDateTime.now());

        if (deletedCount == 0) {
            throw new ResourceNotFoundException("Message not found or you don't have permission to delete it");
        }

        log.info("Message {} deleted", messageId);
    }

    // Helper method for DTO mapping
    private MessageDto mapToDto(Message message) {
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

    // Import for Map
    private static class Map {
        static java.util.Map<String, Object> of(String k1, Object v1, String k2, Object v2) {
            return java.util.Map.of(k1, v1, k2, v2);
        }
    }
}
