package com.clinicbooking.chatbotservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ClassifyQuestionRequest(
        @NotBlank(message = "question is required")
        String question
) {
}
