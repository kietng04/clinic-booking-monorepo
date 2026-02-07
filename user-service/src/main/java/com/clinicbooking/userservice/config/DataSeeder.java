package com.clinicbooking.userservice.config;

import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Auto-seed demo users for quick testing
 * Inserts 3 default users (Patient, Doctor, Admin) if they don't exist
 *
 * IMPORTANT: These are DEMO credentials synchronized with frontend LoginPage.jsx
 * DO NOT use in production!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    @Order(1000) // Run after other initialization
    public void seedDemoUsers() {
        log.warn("🌱🌱🌱 DataSeeder.seedDemoUsers() TRIGGERED! 🌱🌱🌱");

        List<DemoUser> demoUsers = List.of(
                new DemoUser(
                        "patient1@clinic.com",
                        "password",
                        "Nguyễn Văn A",
                        User.UserRole.PATIENT,
                        "0909999001",
                        User.Gender.MALE,
                        LocalDate.of(1990, 5, 15)
                ),
                new DemoUser(
                        "dr.sarah@clinic.com",
                        "password",
                        "Dr. Sarah Johnson",
                        User.UserRole.DOCTOR,
                        "0909999002",
                        User.Gender.FEMALE,
                        LocalDate.of(1985, 3, 20)
                ),
                new DemoUser(
                        "admin@clinic.com",
                        "password",
                        "Admin System",
                        User.UserRole.ADMIN,
                        "0909999003",
                        User.Gender.OTHER,
                        LocalDate.of(1980, 1, 1)
                )
        );

        int inserted = 0;
        int skipped = 0;

        for (DemoUser demoUser : demoUsers) {
            if (userRepository.findByEmail(demoUser.email).isEmpty()) {
                User user = User.builder()
                        .email(demoUser.email)
                        .password(passwordEncoder.encode(demoUser.password))
                        .fullName(demoUser.fullName)
                        .role(demoUser.role)
                        .phone(demoUser.phone)
                        .gender(demoUser.gender)
                        .dateOfBirth(demoUser.dateOfBirth)
                        .isActive(true)
                        .build();

                userRepository.save(user);
                inserted++;
                log.info("✅ Created demo user: {} ({})", demoUser.email, demoUser.role);
            } else {
                skipped++;
                log.debug("⏭️  Demo user already exists: {}", demoUser.email);
            }
        }

        if (inserted > 0) {
            log.info("🎉 Demo user seeding completed! Inserted: {}, Skipped: {}", inserted, skipped);
            log.info("📝 Demo credentials (synchronized with frontend LoginPage.jsx):");
            log.info("   - Patient: patient1@clinic.com / password (Phone: 0909999001)");
            log.info("   - Doctor:  dr.sarah@clinic.com / password (Phone: 0909999002)");
            log.info("   - Admin:   admin@clinic.com / password (Phone: 0909999003)");
        } else {
            log.info("✨ All demo users already exist ({}), no seeding needed", demoUsers.size());
        }
    }

    /**
     * Demo user data class
     */
    private record DemoUser(
            String email,
            String password,
            String fullName,
            User.UserRole role,
            String phone,
            User.Gender gender,
            LocalDate dateOfBirth
    ) {}
}
