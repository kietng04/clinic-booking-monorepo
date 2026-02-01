package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.entity.VerificationCode;
import com.clinicbooking.userservice.security.JwtService;
import com.clinicbooking.userservice.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final JwtService jwtService;

    @PostMapping("/send-email-verification")
    public ResponseEntity<Map<String, String>> sendEmailVerification(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = jwtService.extractUserId(
                ((org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken)
                        org.springframework.security.core.SecurityContextHolder.getContext().getAuthentication())
                        .getCredentials().toString());
        verificationService.sendEmailVerification(userId);
        return ResponseEntity.ok(Map.of("message", "Email xác minh đã được gửi"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestParam String token) {
        boolean success = verificationService.verifyEmail(token);
        if (success) {
            return ResponseEntity.ok(Map.of("verified", true, "message", "Email đã được xác minh thành công"));
        }
        return ResponseEntity.badRequest().body(Map.of("verified", false, "message", "Token không hợp lệ hoặc đã hết hiệu lực"));
    }

    @PostMapping("/send-sms-verification")
    public ResponseEntity<Map<String, String>> sendSmsVerification(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        Long userId = jwtService.extractUserId(
                ((org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken)
                        org.springframework.security.core.SecurityContextHolder.getContext().getAuthentication())
                        .getCredentials().toString());
        String phone = request.get("phone");
        verificationService.sendSmsVerification(userId, phone);
        return ResponseEntity.ok(Map.of("message", "Mã SMS đã được gửi"));
    }

    @PostMapping("/verify-sms")
    public ResponseEntity<Map<String, Object>> verifySms(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        Long userId = jwtService.extractUserId(
                ((org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken)
                        org.springframework.security.core.SecurityContextHolder.getContext().getAuthentication())
                        .getCredentials().toString());
        String code = request.get("code");
        boolean success = verificationService.verifySms(userId, code);
        return ResponseEntity.ok(Map.of("verified", success, "message", "Số điện thoại đã được xác minh"));
    }
}
