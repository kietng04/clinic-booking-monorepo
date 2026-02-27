package com.clinicbooking.consultationservice.service;

import com.clinicbooking.consultationservice.dto.MessageDto;
import com.clinicbooking.consultationservice.dto.SendMessageRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for message operations
 */
public interface MessageService {

    /**
     * Send a message in a consultation
     */
    MessageDto sendMessage(SendMessageRequestDto request, Long senderId, String senderRole);

    /**
     * Get all messages for a consultation
     */
    List<MessageDto> getMessagesByConsultation(Long consultationId, Long userId);

    /**
     * Get messages with pagination
     */
    Page<MessageDto> getMessagesByConsultationPaginated(Long consultationId, Long userId, Pageable pageable);

    /**
     * Get unread messages for a consultation
     */
    List<MessageDto> getUnreadMessages(Long consultationId, Long userId);

    /**
     * Mark all messages in a consultation as read
     */
    void markMessagesAsRead(Long consultationId, Long userId);

    /**
     * Count unread messages for a consultation
     */
    Long countUnreadMessages(Long consultationId, Long userId);

    /**
     * Delete a message (soft delete)
     */
    void deleteMessage(Long messageId, Long senderId);
}
