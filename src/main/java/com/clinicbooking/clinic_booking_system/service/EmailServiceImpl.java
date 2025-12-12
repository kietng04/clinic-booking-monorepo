package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@clinicbooking.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    @Async
    public void sendWelcomeEmail(User user) {
        Context context = new Context();
        context.setVariable("userName", user.getFullName());
        context.setVariable("userEmail", user.getEmail());
        context.setVariable("loginUrl", frontendUrl + "/login");

        String content = templateEngine.process("email/welcome", context);
        sendHtmlEmail(user.getEmail(), "Chào mừng bạn đến với Clinic Booking!", content);
    }

    @Override
    @Async
    public void sendEmailVerification(User user, String verificationToken) {
        Context context = new Context();
        context.setVariable("userName", user.getFullName());
        context.setVariable("verificationUrl", frontendUrl + "/verify-email?token=" + verificationToken);

        String content = templateEngine.process("email/verify-email", context);
        sendHtmlEmail(user.getEmail(), "Xác thực email của bạn", content);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        Context context = new Context();
        context.setVariable("userName", user.getFullName());
        context.setVariable("resetUrl", frontendUrl + "/reset-password?token=" + resetToken);
        context.setVariable("expirationMinutes", 30);

        String content = templateEngine.process("email/reset-password", context);
        sendHtmlEmail(user.getEmail(), "Đặt lại mật khẩu", content);
    }

    @Override
    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();

        Context context = new Context();
        context.setVariable("patientName", patient.getFullName());
        context.setVariable("doctorName", doctor.getFullName());
        context.setVariable("doctorSpecialization", doctor.getSpecialization());
        context.setVariable("appointmentDate", appointment.getAppointmentDate().format(DATE_FORMATTER));
        context.setVariable("appointmentTime", appointment.getAppointmentTime().format(TIME_FORMATTER));
        context.setVariable("appointmentType", appointment.getType() != null ?
                (appointment.getType().name().equals("ONLINE") ? "Trực tuyến" : "Trực tiếp") : "Chưa xác định");

        String content = templateEngine.process("email/appointment-confirmation", context);
        sendHtmlEmail(patient.getEmail(), "Xác nhận lịch hẹn khám", content);
    }

    @Override
    @Async
    public void sendAppointmentReminder(Appointment appointment) {
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();

        Context context = new Context();
        context.setVariable("patientName", patient.getFullName());
        context.setVariable("doctorName", doctor.getFullName());
        context.setVariable("appointmentDate", appointment.getAppointmentDate().format(DATE_FORMATTER));
        context.setVariable("appointmentTime", appointment.getAppointmentTime().format(TIME_FORMATTER));
        context.setVariable("workplace", doctor.getWorkplace());

        String content = templateEngine.process("email/appointment-reminder", context);
        sendHtmlEmail(patient.getEmail(), "Nhắc nhở lịch hẹn khám", content);
    }

    @Override
    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();

        Context context = new Context();
        context.setVariable("patientName", patient.getFullName());
        context.setVariable("doctorName", doctor.getFullName());
        context.setVariable("appointmentDate", appointment.getAppointmentDate().format(DATE_FORMATTER));
        context.setVariable("appointmentTime", appointment.getAppointmentTime().format(TIME_FORMATTER));
        context.setVariable("cancelReason", appointment.getCancelReason());
        context.setVariable("bookingUrl", frontendUrl + "/book-appointment");

        String content = templateEngine.process("email/appointment-cancellation", context);
        sendHtmlEmail(patient.getEmail(), "Lịch hẹn đã bị hủy", content);
    }

    @Override
    @Async
    public void sendGenericEmail(String to, String subject, String content) {
        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }
}
