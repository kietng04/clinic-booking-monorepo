package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findByUserIdAndTypeAndIsVerifiedFalse(
            Long userId, VerificationCode.VerificationType type);
    Optional<VerificationCode> findByUserIdAndCode(Long userId, String code);
    Optional<VerificationCode> findByCodeAndType(String code, VerificationCode.VerificationType type);
}
