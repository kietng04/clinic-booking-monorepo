package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.exception.GlobalExceptionHandler;
import com.clinicbooking.userservice.service.ProfileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProfileControllerNotificationValidationTest {

    private ProfileService profileService;
    private MockMvc mockMvc;
    private LocalValidatorFactoryBean validator;

    @BeforeEach
    void setUp() {
        profileService = Mockito.mock(ProfileService.class);
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new ProfileController(profileService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("user@test.local", null);
        authentication.setDetails(10L);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        validator.close();
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateNotificationPreferences_withMissingFields_returns400() throws Exception {
        mockMvc.perform(put("/api/profile/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "emailReminders": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("METHOD_ARGUMENT_NOT_VALID"))
                .andExpect(jsonPath("$.details.emailPrescription").exists())
                .andExpect(jsonPath("$.details.reminderTiming").exists());
    }

    @Test
    void updateNotificationPreferences_withInvalidReminderTiming_returns400() throws Exception {
        mockMvc.perform(put("/api/profile/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "emailReminders": true,
                                  "emailPrescription": true,
                                  "emailLabResults": true,
                                  "emailMarketing": false,
                                  "smsReminders": true,
                                  "smsUrgent": true,
                                  "pushAll": true,
                                  "reminderTiming": "NEXT_WEEK"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("HTTP_MESSAGE_NOT_READABLE"))
                .andExpect(jsonPath("$.message").value("Request body không hợp lệ"));
    }
}
