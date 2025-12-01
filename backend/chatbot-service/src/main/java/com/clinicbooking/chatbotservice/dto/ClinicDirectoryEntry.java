package com.clinicbooking.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ClinicDirectoryEntry(
        Long id,
        String name,
        String address,
        String openingHours,
        Boolean isActive
) {
}
