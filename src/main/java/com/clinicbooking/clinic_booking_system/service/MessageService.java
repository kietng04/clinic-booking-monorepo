package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.message.MessageCreateDto;
import com.clinicbooking.clinic_booking_system.dto.message.MessageResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Consultation;
import com.clinicbooking.clinic_booking_system.entity.Message;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.MessageMapper;
import com.clinicbooking.clinic_booking_system.repository.ConsultationRepository;
import com.clinicbooking.clinic_booking_system.repository.MessageRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final MessageMapper mapper;

    public MessageResponseDto create(MessageCreateDto dto) {
        Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", dto.getConsultationId()));

        if (consultation.getStatus() != Consultation.ConsultationStatus.ACTIVE) {
            throw new BadRequestException("Chỉ có thể gửi tin nhắn trong tư vấn đang hoạt động");
        }

        var sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getSenderId()));

        Message message = mapper.toEntity(dto);
        message.setConsultation(consultation);
        message.setSender(sender);
        Message saved = messageRepository.save(message);
        return mapper.toResponseDto(saved);
    }

    public MessageResponseDto getById(Long id) {
        return mapper.toResponseDto(findByIdOrThrow(id));
    }

    public PageResponse<MessageResponseDto> getAllByConsultation(Long consultationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConsultationIdOrderByCreatedAtAsc(consultationId, pageable);
        return buildPageResponse(messagePage);
    }

    public List<MessageResponseDto> getUnreadByConsultation(Long consultationId) {
        List<Message> unread = messageRepository.findByConsultationIdAndIsReadFalse(consultationId);
        return mapper.toResponseDtoList(unread);
    }

    public long getUnreadCount(Long consultationId) {
        return messageRepository.countByConsultationIdAndIsReadFalse(consultationId);
    }

    public MessageResponseDto markAsRead(Long id) {
        Message message = findByIdOrThrow(id);
        message.setIsRead(true);
        Message updated = messageRepository.save(message);
        return mapper.toResponseDto(updated);
    }

    public void markAllAsReadForConsultation(Long consultationId) {
        List<Message> unread = messageRepository.findByConsultationIdAndIsReadFalse(consultationId);
        unread.forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(unread);
    }

    public void delete(Long id) {
        Message message = findByIdOrThrow(id);
        messageRepository.delete(message);
    }

    private Message findByIdOrThrow(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
    }

    private PageResponse<MessageResponseDto> buildPageResponse(Page<Message> page) {
        List<MessageResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<MessageResponseDto>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();
    }
}
