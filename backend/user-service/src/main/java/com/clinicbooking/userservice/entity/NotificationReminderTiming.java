package com.clinicbooking.userservice.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum NotificationReminderTiming {
    ONE_HOUR("1_HOUR"),
    TWO_HOURS("2_HOURS"),
    ONE_DAY("1_DAY"),
    TWO_DAYS("2_DAYS");

    private final String value;

    NotificationReminderTiming(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NotificationReminderTiming fromValue(String value) {
        return Arrays.stream(values())
                .filter(candidate -> candidate.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported reminder timing: " + value));
    }
}
