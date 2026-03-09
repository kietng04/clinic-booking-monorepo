package com.clinicbooking.userservice.dto.profile;

import com.clinicbooking.userservice.entity.NotificationReminderTiming;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesDto {
    @NotNull(message = "emailReminders không được để trống")
    private Boolean emailReminders;

    @NotNull(message = "emailPrescription không được để trống")
    private Boolean emailPrescription;

    @NotNull(message = "emailLabResults không được để trống")
    private Boolean emailLabResults;

    @NotNull(message = "emailMarketing không được để trống")
    private Boolean emailMarketing;

    @NotNull(message = "smsReminders không được để trống")
    private Boolean smsReminders;

    @NotNull(message = "smsUrgent không được để trống")
    private Boolean smsUrgent;

    @NotNull(message = "pushAll không được để trống")
    private Boolean pushAll;

    @NotNull(message = "reminderTiming không được để trống")
    private NotificationReminderTiming reminderTiming;
}
