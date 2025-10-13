package com.clinicbooking.consultationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for creating a new consultation request
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequestDto {

    /**
     * ID of the doctor to consult with
     */
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    /**
     * Topic or reason for consultation
     */
    @NotBlank(message = "Topic is required")
    @Size(min = 5, max = 500, message = "Topic must be between 5 and 500 characters")
    private String topic;

    /**
     * Detailed description of symptoms or concerns
     */
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    /**
     * Consultation fee (optional, will use default if not provided)
     */
    private BigDecimal fee;
}
