package com.clinicbooking.consultationservice.repository;

import com.clinicbooking.consultationservice.entity.Message;
import com.clinicbooking.consultationservice.entity.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Message entity
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find all messages for a consultation, ordered by timestamp
     */
    List<Message> findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(Long consultationId);

    /**
     * Find messages for a consultation with pagination
     */
    Page<Message> findByConsultationIdAndIsDeletedFalseOrderBySentAtDesc(Long consultationId, Pageable pageable);

    /**
     * Find unread messages for a consultation by recipient
     */
    @Query("SELECT m FROM Message m WHERE m.consultationId = :consultationId " +
           "AND m.senderId != :recipientId AND m.isRead = false AND m.isDeleted = false " +
           "ORDER BY m.sentAt ASC")
    List<Message> findUnreadMessages(@Param("consultationId") Long consultationId,
                                     @Param("recipientId") Long recipientId);

    /**
     * Count unread messages for a consultation by recipient
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.consultationId = :consultationId " +
           "AND m.senderId != :recipientId AND m.isRead = false AND m.isDeleted = false")
    Long countUnreadMessages(@Param("consultationId") Long consultationId,
                            @Param("recipientId") Long recipientId);

    /**
     * Count total unread messages for a user across all consultations
     */
    @Query("SELECT COUNT(m) FROM Message m JOIN Consultation c ON m.consultationId = c.id " +
           "WHERE ((c.patientId = :userId AND m.senderId = c.doctorId) " +
           "OR (c.doctorId = :userId AND m.senderId = c.patientId)) " +
           "AND m.isRead = false AND m.isDeleted = false")
    Long countTotalUnreadMessagesByUser(@Param("userId") Long userId);

    /**
     * Find latest message for a consultation
     */
    @Query("SELECT m FROM Message m WHERE m.consultationId = :consultationId " +
           "AND m.isDeleted = false ORDER BY m.sentAt DESC LIMIT 1")
    Message findLatestMessage(@Param("consultationId") Long consultationId);

    /**
     * Mark messages as read
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt " +
           "WHERE m.consultationId = :consultationId AND m.senderId != :recipientId " +
           "AND m.isRead = false")
    int markMessagesAsRead(@Param("consultationId") Long consultationId,
                          @Param("recipientId") Long recipientId,
                          @Param("readAt") LocalDateTime readAt);

    /**
     * Soft delete a message
     */
    @Modifying
    @Query("UPDATE Message m SET m.isDeleted = true, m.deletedAt = :deletedAt " +
           "WHERE m.id = :messageId AND m.senderId = :senderId")
    int softDeleteMessage(@Param("messageId") Long messageId,
                         @Param("senderId") Long senderId,
                         @Param("deletedAt") LocalDateTime deletedAt);

    /**
     * Find messages by type
     */
    List<Message> findByConsultationIdAndTypeAndIsDeletedFalseOrderBySentAtDesc(
            Long consultationId, MessageType type);

    /**
     * Find messages sent after a specific timestamp
     */
    @Query("SELECT m FROM Message m WHERE m.consultationId = :consultationId " +
           "AND m.sentAt > :afterTimestamp AND m.isDeleted = false " +
           "ORDER BY m.sentAt ASC")
    List<Message> findMessagesAfter(@Param("consultationId") Long consultationId,
                                    @Param("afterTimestamp") LocalDateTime afterTimestamp);

    /**
     * Count messages in a consultation
     */
    Long countByConsultationIdAndIsDeletedFalse(Long consultationId);

    /**
     * Delete all messages for a consultation (hard delete - use with caution)
     */
    void deleteByConsultationId(Long consultationId);
}
