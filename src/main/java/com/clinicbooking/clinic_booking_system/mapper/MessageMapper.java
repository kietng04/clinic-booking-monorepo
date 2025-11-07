package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.message.MessageCreateDto;
import com.clinicbooking.clinic_booking_system.dto.message.MessageResponseDto;
import com.clinicbooking.clinic_booking_system.entity.Message;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MessageMapper {

    public Message toEntity(MessageCreateDto dto) {
        return Message.builder()
                .content(dto.getContent())
                .messageType(dto.getMessageType())
                .fileUrl(dto.getFileUrl())
                .isRead(false)
                .build();
    }

    public MessageResponseDto toResponseDto(Message message) {
        return MessageResponseDto.builder()
                .id(message.getId())
                .consultationId(message.getConsultation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .fileUrl(message.getFileUrl())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public List<MessageResponseDto> toResponseDtoList(List<Message> messages) {
        return messages.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
}
