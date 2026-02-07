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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MessageServiceImpl
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Tests")
class MessageServiceImplTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private ConsultationService consultationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageServiceImpl messageService;

    private Consultation testConsultation;
    private Message testMessage;
    private UserInfoDto senderInfo;
    private SendMessageRequestDto sendMessageRequest;

    @BeforeEach
    void setUp() {
        testConsultation = Consultation.builder()
                .id(1L)
                .patientId(1L)
                .patientName("John Doe")
                .doctorId(10L)
                .doctorName("Dr. Smith")
                .status(ConsultationStatus.ACCEPTED)
                .build();

        testMessage = Message.builder()
                .id(1L)
                .consultationId(1L)
                .senderId(10L)
                .senderName("Dr. Smith")
                .senderRole("DOCTOR")
                .type(MessageType.TEXT)
                .content("Hello, how can I help you?")
                .isRead(false)
                .isDeleted(false)
                .sentAt(LocalDateTime.now())
                .build();

        senderInfo = UserInfoDto.builder()
                .id(10L)
                .fullName("Dr. Smith")
                .email("drsmith@example.com")
                .role("DOCTOR")
                .build();

        sendMessageRequest = new SendMessageRequestDto();
        sendMessageRequest.setConsultationId(1L);
        sendMessageRequest.setType(MessageType.TEXT);
        sendMessageRequest.setContent("Hello, how can I help you?");
    }

    @Test
    @DisplayName("Should send message successfully")
    void shouldSendMessage() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        MessageDto result = messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello, how can I help you?");
        assertThat(result.getSenderId()).isEqualTo(10L);
        verify(messageRepository).save(any(Message.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/consultation/1"), any(MessageDto.class));
    }

    @Test
    @DisplayName("Should throw exception when consultation not found")
    void shouldThrowExceptionWhenConsultationNotFound() {
        // Given
        when(consultationRepository.findById(999L)).thenReturn(Optional.empty());
        sendMessageRequest.setConsultationId(999L);

        // When & Then
        assertThatThrownBy(() -> messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Consultation not found");
    }

    @Test
    @DisplayName("Should throw exception when user doesn't have access to consultation")
    void shouldThrowExceptionWhenUserDoesNotHaveAccess() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> messageService.sendMessage(sendMessageRequest, 999L, "DOCTOR"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have access");
    }

    @Test
    @DisplayName("Should throw exception when consultation status is invalid")
    void shouldThrowExceptionWhenConsultationStatusInvalid() {
        // Given
        testConsultation.setStatus(ConsultationStatus.PENDING);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot send messages in current consultation status");
    }

    @Test
    @DisplayName("Should start consultation when sending first message")
    void shouldStartConsultationWhenSendingFirstMessage() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        verify(consultationService).startConsultation(1L);
    }

    @Test
    @DisplayName("Should not start consultation if already in progress")
    void shouldNotStartConsultationIfAlreadyInProgress() {
        // Given
        testConsultation.setStatus(ConsultationStatus.IN_PROGRESS);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        verify(consultationService, never()).startConsultation(anyLong());
    }

    @Test
    @DisplayName("Should send file message successfully")
    void shouldSendFileMessage() {
        // Given
        sendMessageRequest.setType(MessageType.FILE);
        sendMessageRequest.setContent("Medical report");
        sendMessageRequest.setFileUrl("https://example.com/report.pdf");
        sendMessageRequest.setFileName("report.pdf");
        sendMessageRequest.setFileSize(2048L);
        sendMessageRequest.setFileMimeType("application/pdf");

        Message fileMessage = Message.builder()
                .id(2L)
                .consultationId(1L)
                .senderId(10L)
                .senderName("Dr. Smith")
                .senderRole("DOCTOR")
                .type(MessageType.FILE)
                .content("Medical report")
                .fileUrl("https://example.com/report.pdf")
                .fileName("report.pdf")
                .fileSize(2048L)
                .fileMimeType("application/pdf")
                .isRead(false)
                .isDeleted(false)
                .sentAt(LocalDateTime.now())
                .build();

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(fileMessage);

        // When
        MessageDto result = messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(MessageType.FILE);
        assertThat(result.getFileUrl()).isEqualTo("https://example.com/report.pdf");
        assertThat(result.getFileName()).isEqualTo("report.pdf");
    }

    @Test
    @DisplayName("Should get messages by consultation")
    void shouldGetMessagesByConsultation() {
        // Given
        List<Message> messages = Arrays.asList(testMessage);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(1L))
                .thenReturn(messages);

        // When
        List<MessageDto> result = messageService.getMessagesByConsultation(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("Hello, how can I help you?");
        verify(messageRepository).findByConsultationIdAndIsDeletedFalseOrderBySentAtAsc(1L);
    }

    @Test
    @DisplayName("Should throw exception when getting messages without access")
    void shouldThrowExceptionWhenGettingMessagesWithoutAccess() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> messageService.getMessagesByConsultation(1L, 999L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have access");
    }

    @Test
    @DisplayName("Should get messages with pagination")
    void shouldGetMessagesWithPagination() {
        // Given
        List<Message> messages = Arrays.asList(testMessage);
        Page<Message> page = new PageImpl<>(messages);
        Pageable pageable = PageRequest.of(0, 10);

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(messageRepository.findByConsultationIdAndIsDeletedFalseOrderBySentAtDesc(1L, pageable))
                .thenReturn(page);

        // When
        Page<MessageDto> result = messageService.getMessagesByConsultationPaginated(1L, 1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(messageRepository).findByConsultationIdAndIsDeletedFalseOrderBySentAtDesc(1L, pageable);
    }

    @Test
    @DisplayName("Should get unread messages")
    void shouldGetUnreadMessages() {
        // Given
        List<Message> unreadMessages = Arrays.asList(testMessage);
        when(messageRepository.findUnreadMessages(1L, 1L)).thenReturn(unreadMessages);

        // When
        List<MessageDto> result = messageService.getUnreadMessages(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(messageRepository).findUnreadMessages(1L, 1L);
    }

    @Test
    @DisplayName("Should mark messages as read")
    void shouldMarkMessagesAsRead() {
        // Given
        when(messageRepository.markMessagesAsRead(eq(1L), eq(1L), any(LocalDateTime.class)))
                .thenReturn(2);

        // When
        messageService.markMessagesAsRead(1L, 1L);

        // Then
        verify(messageRepository).markMessagesAsRead(eq(1L), eq(1L), any(LocalDateTime.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/consultation/1/read"), anyMap());
    }

    @Test
    @DisplayName("Should count unread messages")
    void shouldCountUnreadMessages() {
        // Given
        when(messageRepository.countUnreadMessages(1L, 1L)).thenReturn(3L);

        // When
        Long count = messageService.countUnreadMessages(1L, 1L);

        // Then
        assertThat(count).isEqualTo(3L);
        verify(messageRepository).countUnreadMessages(1L, 1L);
    }

    @Test
    @DisplayName("Should delete message successfully")
    void shouldDeleteMessage() {
        // Given
        when(messageRepository.softDeleteMessage(eq(1L), eq(10L), any(LocalDateTime.class)))
                .thenReturn(1);

        // When
        messageService.deleteMessage(1L, 10L);

        // Then
        verify(messageRepository).softDeleteMessage(eq(1L), eq(10L), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should throw exception when deleting message without permission")
    void shouldThrowExceptionWhenDeletingMessageWithoutPermission() {
        // Given
        when(messageRepository.softDeleteMessage(eq(1L), eq(999L), any(LocalDateTime.class)))
                .thenReturn(0);

        // When & Then
        assertThatThrownBy(() -> messageService.deleteMessage(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Message not found or you don't have permission");
    }

    @Test
    @DisplayName("Should use default message type when not provided")
    void shouldUseDefaultMessageTypeWhenNotProvided() {
        // Given
        sendMessageRequest.setType(null);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        MessageDto result = messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        assertThat(result).isNotNull();
        verify(messageRepository).save(argThat(message ->
                message.getType() == MessageType.TEXT
        ));
    }

    @Test
    @DisplayName("Should set sender information correctly")
    void shouldSetSenderInformationCorrectly() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        verify(messageRepository).save(argThat(message ->
                message.getSenderId().equals(10L) &&
                message.getSenderName().equals("Dr. Smith") &&
                message.getSenderRole().equals("DOCTOR")
        ));
    }

    @Test
    @DisplayName("Should initialize message flags correctly")
    void shouldInitializeMessageFlagsCorrectly() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(10L)).thenReturn(senderInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // When
        messageService.sendMessage(sendMessageRequest, 10L, "DOCTOR");

        // Then
        verify(messageRepository).save(argThat(message ->
                message.getIsRead().equals(false) &&
                message.getIsDeleted().equals(false)
        ));
    }

    @Test
    @DisplayName("Should allow patient to send message")
    void shouldAllowPatientToSendMessage() {
        // Given
        UserInfoDto patientInfo = UserInfoDto.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .role("PATIENT")
                .build();

        Message patientMessage = Message.builder()
                .id(2L)
                .consultationId(1L)
                .senderId(1L)
                .senderName("John Doe")
                .senderRole("PATIENT")
                .type(MessageType.TEXT)
                .content("I have chest pain")
                .isRead(false)
                .isDeleted(false)
                .sentAt(LocalDateTime.now())
                .build();

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(userServiceClient.getUserById(1L)).thenReturn(patientInfo);
        when(messageRepository.save(any(Message.class))).thenReturn(patientMessage);

        // When
        MessageDto result = messageService.sendMessage(sendMessageRequest, 1L, "PATIENT");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getSenderRole()).isEqualTo("PATIENT");
        verify(messageRepository).save(any(Message.class));
    }
}
