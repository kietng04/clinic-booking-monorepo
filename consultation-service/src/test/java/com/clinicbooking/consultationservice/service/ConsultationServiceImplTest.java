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
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ConsultationServiceImpl
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ConsultationService Tests")
class ConsultationServiceImplTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private ConsultationServiceImpl consultationService;

    private Consultation testConsultation;
    private UserInfoDto patientInfo;
    private UserInfoDto doctorInfo;
    private ConsultationRequestDto requestDto;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(consultationService, "defaultFee", new BigDecimal("200000"));

        testConsultation = Consultation.builder()
                .id(1L)
                .patientId(1L)
                .patientName("John Doe")
                .doctorId(10L)
                .doctorName("Dr. Smith")
                .specialization("Cardiology")
                .topic("Heart pain consultation")
                .description("Experiencing chest pain")
                .status(ConsultationStatus.PENDING)
                .fee(new BigDecimal("200000"))
                .isPaid(false)
                .createdAt(LocalDateTime.now())
                .build();

        patientInfo = UserInfoDto.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .role("PATIENT")
                .isActive(true)
                .build();

        doctorInfo = UserInfoDto.builder()
                .id(10L)
                .fullName("Dr. Smith")
                .email("drsmith@example.com")
                .role("DOCTOR")
                .specialization("Cardiology")
                .isActive(true)
                .build();

        requestDto = new ConsultationRequestDto();
        requestDto.setDoctorId(10L);
        requestDto.setTopic("Heart pain consultation");
        requestDto.setDescription("Experiencing chest pain");
        requestDto.setFee(new BigDecimal("200000"));
    }

    @Test
    @DisplayName("Should create consultation successfully")
    void shouldCreateConsultation() {
        // Given
        when(userServiceClient.getUserById(1L)).thenReturn(patientInfo);
        when(userServiceClient.getDoctorById(10L)).thenReturn(doctorInfo);
        when(consultationRepository.save(any(Consultation.class))).thenReturn(testConsultation);
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.createConsultation(requestDto, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPatientId()).isEqualTo(1L);
        assertThat(result.getDoctorId()).isEqualTo(10L);
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.PENDING);
        verify(consultationRepository).save(any(Consultation.class));
        verify(userServiceClient).getUserById(1L);
        verify(userServiceClient).getDoctorById(10L);
    }

    @Test
    @DisplayName("Should throw exception when doctor is not active")
    void shouldThrowExceptionWhenDoctorNotActive() {
        // Given
        doctorInfo.setIsActive(false);
        when(userServiceClient.getUserById(1L)).thenReturn(patientInfo);
        when(userServiceClient.getDoctorById(10L)).thenReturn(doctorInfo);

        // When & Then
        assertThatThrownBy(() -> consultationService.createConsultation(requestDto, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Doctor is not active");
    }

    @Test
    @DisplayName("Should use default fee when not provided")
    void shouldUseDefaultFeeWhenNotProvided() {
        // Given
        requestDto.setFee(null);
        when(userServiceClient.getUserById(1L)).thenReturn(patientInfo);
        when(userServiceClient.getDoctorById(10L)).thenReturn(doctorInfo);
        when(consultationRepository.save(any(Consultation.class))).thenReturn(testConsultation);
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.createConsultation(requestDto, 1L);

        // Then
        assertThat(result.getFee()).isEqualTo(new BigDecimal("200000"));
    }

    @Test
    @DisplayName("Should get consultation by ID successfully")
    void shouldGetConsultationById() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(messageRepository.countUnreadMessages(1L, 1L)).thenReturn(2L);
        when(messageRepository.findLatestMessage(1L)).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.getConsultationById(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUnreadCount()).isEqualTo(2L);
        verify(consultationRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when consultation not found")
    void shouldThrowExceptionWhenConsultationNotFound() {
        // Given
        when(consultationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> consultationService.getConsultationById(999L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Consultation not found");
    }

    @Test
    @DisplayName("Should throw exception when user doesn't have access")
    void shouldThrowExceptionWhenUserDoesNotHaveAccess() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> consultationService.getConsultationById(1L, 999L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have access");
    }

    @Test
    @DisplayName("Should get consultations by patient")
    void shouldGetConsultationsByPatient() {
        // Given
        List<Consultation> consultations = Arrays.asList(testConsultation);
        Page<Consultation> page = new PageImpl<>(consultations);
        Pageable pageable = PageRequest.of(0, 10);

        when(consultationRepository.findByPatientIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page);
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        Page<ConsultationSummaryDto> result = consultationService.getConsultationsByPatient(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getPatientId()).isEqualTo(1L);
        verify(consultationRepository).findByPatientIdOrderByCreatedAtDesc(1L, pageable);
    }

    @Test
    @DisplayName("Should get consultations by doctor")
    void shouldGetConsultationsByDoctor() {
        // Given
        List<Consultation> consultations = Arrays.asList(testConsultation);
        Page<Consultation> page = new PageImpl<>(consultations);
        Pageable pageable = PageRequest.of(0, 10);

        when(consultationRepository.findByDoctorIdOrderByCreatedAtDesc(10L, pageable)).thenReturn(page);
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        Page<ConsultationSummaryDto> result = consultationService.getConsultationsByDoctor(10L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(consultationRepository).findByDoctorIdOrderByCreatedAtDesc(10L, pageable);
    }

    @Test
    @DisplayName("Should get pending consultations by doctor")
    void shouldGetPendingConsultationsByDoctor() {
        // Given
        when(consultationRepository.findPendingConsultationsByDoctor(10L))
                .thenReturn(Arrays.asList(testConsultation));
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        List<ConsultationSummaryDto> result = consultationService.getPendingConsultationsByDoctor(10L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ConsultationStatus.PENDING);
    }

    @Test
    @DisplayName("Should accept consultation successfully")
    void shouldAcceptConsultation() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> {
            Consultation c = invocation.getArgument(0);
            c.setStatus(ConsultationStatus.ACCEPTED);
            c.setAcceptedAt(LocalDateTime.now());
            return c;
        });
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.acceptConsultation(1L, 10L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.ACCEPTED);
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    @DisplayName("Should throw exception when wrong doctor tries to accept")
    void shouldThrowExceptionWhenWrongDoctorAccepts() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> consultationService.acceptConsultation(1L, 999L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have permission");
    }

    @Test
    @DisplayName("Should throw exception when consultation is not pending")
    void shouldThrowExceptionWhenNotPending() {
        // Given
        testConsultation.setStatus(ConsultationStatus.ACCEPTED);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> consultationService.acceptConsultation(1L, 10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not in PENDING status");
    }

    @Test
    @DisplayName("Should reject consultation successfully")
    void shouldRejectConsultation() {
        // Given
        RejectConsultationRequestDto rejectDto = new RejectConsultationRequestDto();
        rejectDto.setReason("Not available");

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> {
            Consultation c = invocation.getArgument(0);
            c.setStatus(ConsultationStatus.REJECTED);
            c.setRejectionReason("Not available");
            return c;
        });
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.rejectConsultation(1L, 10L, rejectDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.REJECTED);
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    @DisplayName("Should start consultation successfully")
    void shouldStartConsultation() {
        // Given
        testConsultation.setStatus(ConsultationStatus.ACCEPTED);
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> {
            Consultation c = invocation.getArgument(0);
            c.setStatus(ConsultationStatus.IN_PROGRESS);
            c.setStartedAt(LocalDateTime.now());
            return c;
        });
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.startConsultation(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.IN_PROGRESS);
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    @DisplayName("Should complete consultation successfully")
    void shouldCompleteConsultation() {
        // Given
        testConsultation.setStatus(ConsultationStatus.IN_PROGRESS);
        CompleteConsultationRequestDto completeDto = new CompleteConsultationRequestDto();
        completeDto.setDoctorNotes("Patient is doing well");
        completeDto.setDiagnosis("Mild chest pain");
        completeDto.setPrescription("Rest and medication");

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> {
            Consultation c = invocation.getArgument(0);
            c.setStatus(ConsultationStatus.COMPLETED);
            c.setCompletedAt(LocalDateTime.now());
            c.setDoctorNotes("Patient is doing well");
            c.setDiagnosis("Mild chest pain");
            c.setPrescription("Rest and medication");
            return c;
        });
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.completeConsultation(1L, 10L, completeDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.COMPLETED);
        assertThat(result.getDoctorNotes()).isEqualTo("Patient is doing well");
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    @DisplayName("Should throw exception when completing consultation with wrong doctor")
    void shouldThrowExceptionWhenCompletingWithWrongDoctor() {
        // Given
        testConsultation.setStatus(ConsultationStatus.IN_PROGRESS);
        CompleteConsultationRequestDto completeDto = new CompleteConsultationRequestDto();
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> consultationService.completeConsultation(1L, 999L, completeDto))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have permission");
    }

    @Test
    @DisplayName("Should cancel consultation successfully")
    void shouldCancelConsultation() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(invocation -> {
            Consultation c = invocation.getArgument(0);
            c.setStatus(ConsultationStatus.CANCELLED);
            return c;
        });
        when(messageRepository.countUnreadMessages(anyLong(), anyLong())).thenReturn(0L);
        when(messageRepository.findLatestMessage(anyLong())).thenReturn(null);

        // When
        ConsultationResponseDto result = consultationService.cancelConsultation(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ConsultationStatus.CANCELLED);
        verify(consultationRepository).save(any(Consultation.class));
    }

    @Test
    @DisplayName("Should throw exception when wrong patient tries to cancel")
    void shouldThrowExceptionWhenWrongPatientCancels() {
        // Given
        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));

        // When & Then
        assertThatThrownBy(() -> consultationService.cancelConsultation(1L, 999L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You don't have permission");
    }

    @Test
    @DisplayName("Should get total unread count")
    void shouldGetTotalUnreadCount() {
        // Given
        when(messageRepository.countTotalUnreadMessagesByUser(1L)).thenReturn(5L);

        // When
        Long count = consultationService.getTotalUnreadCount(1L);

        // Then
        assertThat(count).isEqualTo(5L);
        verify(messageRepository).countTotalUnreadMessagesByUser(1L);
    }

    @Test
    @DisplayName("Should include latest message in response")
    void shouldIncludeLatestMessageInResponse() {
        // Given
        Message latestMessage = Message.builder()
                .id(1L)
                .consultationId(1L)
                .senderId(10L)
                .senderName("Dr. Smith")
                .content("Latest message")
                .build();

        when(consultationRepository.findById(1L)).thenReturn(Optional.of(testConsultation));
        when(messageRepository.countUnreadMessages(1L, 1L)).thenReturn(0L);
        when(messageRepository.findLatestMessage(1L)).thenReturn(latestMessage);

        // When
        ConsultationResponseDto result = consultationService.getConsultationById(1L, 1L);

        // Then
        assertThat(result.getLatestMessage()).isNotNull();
        assertThat(result.getLatestMessage().getContent()).isEqualTo("Latest message");
    }
}
