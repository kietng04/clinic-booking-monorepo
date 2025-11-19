package com.clinicbooking.chatbotservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record IntentDefinition(
        String id,
        String name,
        String description,
        List<String> keywords
) {
}
