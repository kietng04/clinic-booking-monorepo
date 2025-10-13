package com.clinicbooking.userservice.service;

@FunctionalInterface
public interface EmailService {
    void sendEmail(String to, String subject, String body);

    default void sendPasswordResetEmail(String email, String resetLink) {
        String subject = "Đặt lại mật khẩu - HealthFlow";
        String body = "<h2>Đặt lại mật khẩu</h2>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấp link sau để tiếp tục:</p>"
                + "<p><a href=\"" + resetLink + "\" style=\"color: #16a34a; font-weight: bold;\">Đặt lại mật khẩu</a></p>"
                + "<p>Link này sẽ hết hiệu lực sau 24 giờ.</p>"
                + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>";
        sendEmail(email, subject, body);
    }

    default void sendVerificationEmail(String email, String verificationLink) {
        String subject = "Xác minh email - HealthFlow";
        String body = "<h2>Xác minh email của bạn</h2>"
                + "<p>Nhấp link sau để xác minh email:</p>"
                + "<p><a href=\"" + verificationLink + "\" style=\"color: #16a34a; font-weight: bold;\">Xác minh email</a></p>"
                + "<p>Link này sẽ hết hiệu lực sau 24 giờ.</p>";
        sendEmail(email, subject, body);
    }

    default void sendWelcomeEmail(String email, String name) {
        String subject = "Chào mừng bạn đến với HealthFlow!";
        String body = "<h2>Chào mừng " + name + "!</h2>"
                + "<p>Cảm ơn bạn đã đăng ký tài khoản HealthFlow.</p>"
                + "<p>Bạn có thể bắt đầu đặt lịch khám ngay bây giờ.</p>";
        sendEmail(email, subject, body);
    }
}
