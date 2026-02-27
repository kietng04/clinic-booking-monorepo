package com.clinicbooking.consultationservice.repository;

import com.clinicbooking.consultationservice.entity.Message;
import com.clinicbooking.consultationservice.entity.MessageType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for MessageRepository
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("MessageRepository Tests")
class MessageRepositoryTest {

    @Autowired
    private MessageRepository messageRepository;

    private Message testMessage1;
    private Message testMessage2;
    private Message testMessage3;

    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();

        testMessage1 = Message.builder()
                .consultationId(1L)
                .senderId(100L)
                .senderName("Dr. Smith")
                .senderRole("DOCTOR")
                .type(MessageType.TEXT)
                .content("Hello, how can I help you?")
                .isRead(false)
                .isDeleted(false)
                .build();

        testMessage2 = Message.builder()
                .consultationId(1L)
                .senderId(200L)
                .senderName("John Doe")
                .senderRole("PATIENT")
                .type(MessageType.TEXT)
                .content("I have chest pain")
                .isRead(false)
                .isDeleted(false)
                .build();

        testMessage3 = Message.builder()
                .consultationId(1L)
                .senderId(100L)
                .senderName("Dr. Smith")
                .senderRole("DOCTOR")
                .type(MessageType.IMAGE)
                .content("Please check this image")
                .fileUrl("https://example.com/image.jpg")
                .fileName("xray.jpg")
                .fileSize(1024L)
                .fileMimeType("image/jpeg")
                .isRead(true)
                .readAt(LocalDateTime.now())
                .isDeleted(false)
                .build();
    }

    @Test
    @DisplayName("Should save message successfully")
    void shouldSaveMessage() {
        // When
        Message saved = messageRepository.save(testMessage1);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getConsultationId()).isEqualTo(1L);
        assertThat(saved.getSenderId()).isEqualTo(100L);
        assertThat(saved.getContent()).isEqualTo("Hello, how can I help you?");
        assertThat(saved.getSentAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find messages by consultation ID ordered by sent date")
    void shouldFindByConsultationIdAndIsDeletedFalseOrderBySentAtAsc() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.save(testMessage3);

        // When
        List<Message> result = messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getConsultationId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should find messages with pagination")
    void shouldFindByConsultationIdWithPagination() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.save(testMessage3);

        // When
        Page<Message> result = messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtDesc(
                1L, PageRequest.of(0, 2));

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should find unread messages for recipient")
    void shouldFindUnreadMessages() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.save(testMessage3);

        // When - Finding messages not sent by user 200 (patient) and unread
        List<Message> result = messageRepository.findUnreadMessages(1L, 200L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1); // Only testMessage1 is unread and sent by doctor
        assertThat(result.get(0).getSenderId()).isNotEqualTo(200L);
        assertThat(result.get(0).getIsRead()).isFalse();
    }

    @Test
    @DisplayName("Should count unread messages for recipient")
    void shouldCountUnreadMessages() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);

        // When - Counting messages not sent by user 200 (patient) and unread
        Long count = messageRepository.countUnreadMessages(1L, 200L);

        // Then
        assertThat(count).isEqualTo(1); // Only testMessage1
    }

    @Test
    @DisplayName("Should find latest message for consultation")
    void shouldFindLatestMessage() throws Exception {
        // Given
        messageRepository.save(testMessage1);
        Thread.sleep(10); // Ensure different timestamps
        messageRepository.save(testMessage2);
        Thread.sleep(10);
        messageRepository.save(testMessage3);

        // When
        Message latest = messageRepository.findLatestMessage(1L);

        // Then
        assertThat(latest).isNotNull();
        assertThat(latest.getContent()).isEqualTo("Please check this image");
    }

    @Test
    @DisplayName("Should mark messages as read")
    void shouldMarkMessagesAsRead() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.flush();

        // When
        int updatedCount = messageRepository.markMessagesAsRead(1L, 200L, LocalDateTime.now());

        // Then
        assertThat(updatedCount).isEqualTo(1); // Only testMessage1 should be marked as read
    }

    @Test
    @DisplayName("Should soft delete message")
    void shouldSoftDeleteMessage() {
        // Given
        Message saved = messageRepository.save(testMessage1);
        messageRepository.flush();

        // When
        int deletedCount = messageRepository.softDeleteMessage(
                saved.getId(), saved.getSenderId(), LocalDateTime.now());
        messageRepository.flush();

        // Then
        assertThat(deletedCount).isEqualTo(1);

        // Verify soft deletion
        List<Message> messages = messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(1L);
        assertThat(messages).isEmpty();
    }

    @Test
    @DisplayName("Should not soft delete message if sender doesn't match")
    void shouldNotSoftDeleteMessageWithWrongSender() {
        // Given
        Message saved = messageRepository.save(testMessage1);
        messageRepository.flush();

        // When
        int deletedCount = messageRepository.softDeleteMessage(
                saved.getId(), 999L, LocalDateTime.now());

        // Then
        assertThat(deletedCount).isEqualTo(0);
    }

    @Test
    @DisplayName("Should find messages by type")
    void shouldFindByConsultationIdAndType() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.save(testMessage3);

        // When
        List<Message> result = messageRepository.findByConsultationIdAndTypeAndIsDeletedFalseOrderBySentAtDesc(
                1L, MessageType.TEXT);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getType()).isEqualTo(MessageType.TEXT);
    }

    @Test
    @DisplayName("Should find messages sent after timestamp")
    void shouldFindMessagesAfter() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        messageRepository.save(testMessage1);

        // When
        List<Message> result = messageRepository.findMessagesAfter(1L, now.minusMinutes(1));

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should count messages in consultation")
    void shouldCountByConsultationId() {
        // Given
        messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.save(testMessage3);

        // When
        Long count = messageRepository.countByConsultationIdAndIsDeletedFalse(1L);

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should exclude deleted messages from count")
    void shouldExcludeDeletedMessagesFromCount() {
        // Given
        Message saved = messageRepository.save(testMessage1);
        messageRepository.save(testMessage2);
        messageRepository.flush();

        messageRepository.softDeleteMessage(saved.getId(), saved.getSenderId(), LocalDateTime.now());
        messageRepository.flush();

        // When
        Long count = messageRepository.countByConsultationIdAndIsDeletedFalse(1L);

        // Then
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle file message correctly")
    void shouldHandleFileMessage() {
        // When
        Message saved = messageRepository.save(testMessage3);

        // Then
        assertThat(saved.getType()).isEqualTo(MessageType.IMAGE);
        assertThat(saved.getFileUrl()).isEqualTo("https://example.com/image.jpg");
        assertThat(saved.getFileName()).isEqualTo("xray.jpg");
        assertThat(saved.getFileSize()).isEqualTo(1024L);
        assertThat(saved.getFileMimeType()).isEqualTo("image/jpeg");
    }
}
