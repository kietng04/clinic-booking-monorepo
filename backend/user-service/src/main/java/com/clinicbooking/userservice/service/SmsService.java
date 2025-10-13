package com.clinicbooking.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    public void sendVerificationSms(String phone, String code) {
        // TODO: Integrate SMS gateway (Twilio/Nexmo)
        log.info("SMS verification code {} sent to {}", code, phone);
    }

    public void sendAppointmentReminder(String phone, String message) {
        // TODO: Integrate SMS gateway
        log.info("SMS reminder sent to {}: {}", phone, message);
    }
}
