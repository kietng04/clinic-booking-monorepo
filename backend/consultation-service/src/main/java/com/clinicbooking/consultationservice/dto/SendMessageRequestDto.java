package com.clinicbooking.consultationservice.dto;

import com.clinicbooking.consultationservice.entity.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending a message in a consultation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequestDto {

    /**
     * ID of the consultation
     */
    @NotNull(message = "Consultation ID is required")
    private Long consultationId;

    /**
     * Type of message (default: TEXT)
     */
    @Builder.Default
    private MessageType type = MessageType.TEXT;

    /**
     * Message content (required for TEXT messages)
     */
    @Size(max = 5000, message = "Message content must not exceed 5000 characters")
    private String content;

    /**
     * File URL (for IMAGE or FILE messages)
     */
    private String fileUrl;

    /**
     * Original filename
     */
    private String fileName;

    /**
     * File size in bytes
     */
    private Long fileSize;

    /**
     * MIME type of file
     */
    private String fileMimeType;
}
