package com.clinicbooking.userservice.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class NotificationReminderTimingConverter
        implements AttributeConverter<NotificationReminderTiming, String> {

    @Override
    public String convertToDatabaseColumn(NotificationReminderTiming attribute) {
        return attribute != null ? attribute.getValue() : null;
    }

    @Override
    public NotificationReminderTiming convertToEntityAttribute(String dbData) {
        return dbData != null ? NotificationReminderTiming.fromValue(dbData) : null;
    }
}
