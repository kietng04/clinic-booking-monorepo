package com.clinicbooking.clinic_booking_system.dto.message;

import com.clinicbooking.clinic_booking_system.entity.Message;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageCreateDto {
    @NotNull
    private Long consultationId;
    @NotNull
    private Long senderId;
    @NotNull
    private String content;
    @Builder.Default
    private Message.MessageType messageType = Message.MessageType.TEXT;
    private String fileUrl;
}
