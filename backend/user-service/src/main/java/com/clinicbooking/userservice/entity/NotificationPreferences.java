package com.clinicbooking.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferences {

    @Column(name = "notification_email_reminders", nullable = false)
    @Builder.Default
    private Boolean emailReminders = true;

    @Column(name = "notification_email_prescription", nullable = false)
    @Builder.Default
    private Boolean emailPrescription = true;

    @Column(name = "notification_email_lab_results", nullable = false)
    @Builder.Default
    private Boolean emailLabResults = true;

    @Column(name = "notification_email_marketing", nullable = false)
    @Builder.Default
    private Boolean emailMarketing = false;

    @Column(name = "notification_sms_reminders", nullable = false)
    @Builder.Default
    private Boolean smsReminders = true;

    @Column(name = "notification_sms_urgent", nullable = false)
    @Builder.Default
    private Boolean smsUrgent = true;

    @Column(name = "notification_push_all", nullable = false)
    @Builder.Default
    private Boolean pushAll = true;

    @Convert(converter = NotificationReminderTimingConverter.class)
    @Column(name = "notification_reminder_timing", nullable = false, length = 20)
    @Builder.Default
    private NotificationReminderTiming reminderTiming = NotificationReminderTiming.ONE_DAY;

    public static NotificationPreferences defaultPreferences() {
        return NotificationPreferences.builder().build();
    }

    public NotificationPreferences normalized() {
        if (isComplete()) {
            return this;
        }
        return NotificationPreferences.builder()
                .emailReminders(coalesce(emailReminders, true))
                .emailPrescription(coalesce(emailPrescription, true))
                .emailLabResults(coalesce(emailLabResults, true))
                .emailMarketing(coalesce(emailMarketing, false))
                .smsReminders(coalesce(smsReminders, true))
                .smsUrgent(coalesce(smsUrgent, true))
                .pushAll(coalesce(pushAll, true))
                .reminderTiming(reminderTiming != null ? reminderTiming : NotificationReminderTiming.ONE_DAY)
                .build();
    }

    public boolean isComplete() {
        return emailReminders != null
                && emailPrescription != null
                && emailLabResults != null
                && emailMarketing != null
                && smsReminders != null
                && smsUrgent != null
                && pushAll != null
                && reminderTiming != null;
    }

    private static Boolean coalesce(Boolean value, boolean defaultValue) {
        return value != null ? value : defaultValue;
    }
}
