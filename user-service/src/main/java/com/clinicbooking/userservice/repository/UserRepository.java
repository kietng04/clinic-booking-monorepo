package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Basic queries
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    // Role-based queries
    Page<User> findByRole(User.UserRole role, Pageable pageable);

    // Doctor-specific queries
    Page<User> findByRoleAndSpecializationContainingIgnoreCase(
            User.UserRole role, String specialization, Pageable pageable);

    Page<User> findByRoleAndRatingGreaterThanEqual(
            User.UserRole role, BigDecimal rating, Pageable pageable);

    // Search doctors with complex criteria
    @Query("SELECT u FROM User u WHERE u.role = :role " +
            "AND (:specialization IS NULL OR LOWER(u.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) " +
            "AND (:minRating IS NULL OR u.rating >= :minRating) " +
            "AND (:maxFee IS NULL OR u.consultationFee <= :maxFee) " +
            "AND u.isActive = true")
    Page<User> searchDoctors(
            @Param("role") User.UserRole role,
            @Param("specialization") String specialization,
            @Param("minRating") BigDecimal minRating,
            @Param("maxFee") BigDecimal maxFee,
            Pageable pageable);

    // Search users with complex criteria
    @Query("SELECT u FROM User u WHERE " +
            "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
            "AND (:phone IS NULL OR u.phone LIKE CONCAT('%', :phone, '%')) " +
            "AND (:fullName IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> searchUsers(
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("fullName") String fullName,
            @Param("role") User.UserRole role,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
