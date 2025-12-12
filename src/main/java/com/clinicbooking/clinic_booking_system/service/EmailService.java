package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.User;

public interface EmailService {

    void sendWelcomeEmail(User user);

    void sendEmailVerification(User user, String verificationToken);

    void sendPasswordResetEmail(User user, String resetToken);

    void sendAppointmentConfirmation(Appointment appointment);

    void sendAppointmentReminder(Appointment appointment);

    void sendAppointmentCancellation(Appointment appointment);

    void sendGenericEmail(String to, String subject, String content);
}
