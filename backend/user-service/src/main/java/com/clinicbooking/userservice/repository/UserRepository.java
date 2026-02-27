package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
            "AND (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "    OR LOWER(u.specialization) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:specialization IS NULL OR LOWER(u.specialization) = LOWER(:specialization)) " +
            "AND (:minRating IS NULL OR u.rating >= :minRating) " +
            "AND (:maxFee IS NULL OR u.consultationFee <= :maxFee) " +
            "AND u.isActive = true")
    Page<User> searchDoctors(
            @Param("role") User.UserRole role,
            @Param("keyword") String keyword,
            @Param("specialization") String specialization,
            @Param("minRating") BigDecimal minRating,
            @Param("maxFee") BigDecimal maxFee,
            Pageable pageable);

    // Get all distinct specializations
    @Query("SELECT DISTINCT u.specialization FROM User u WHERE u.role = 'DOCTOR' AND u.specialization IS NOT NULL AND u.isActive = true ORDER BY u.specialization")
    List<String> findDistinctSpecializations();

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

    // Statistics queries
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false")
    long countInactiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.emailVerified = true")
    long countEmailVerifiedUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.phoneVerified = true")
    long countPhoneVerifiedUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND YEAR(u.createdAt) = YEAR(CURRENT_DATE()) AND MONTH(u.createdAt) = MONTH(CURRENT_DATE())")
    long countNewUsersByRoleThisMonth(@Param("role") User.UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdAt) = YEAR(CURRENT_DATE()) AND MONTH(u.createdAt) = MONTH(CURRENT_DATE())")
    long countNewUsersThisMonth();

    // Analytics queries for dashboard

    // User growth by month
    @Query("SELECT new map(FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') as month, " +
            "COUNT(CASE WHEN u.role = 'PATIENT' THEN 1 END) as patients, " +
            "COUNT(CASE WHEN u.role = 'DOCTOR' THEN 1 END) as doctors, " +
            "COUNT(u) as total) " +
            "FROM User u " +
            "WHERE u.createdAt >= :startDate " +
            "GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') " +
            "ORDER BY month")
    List<Map<String, Object>> getUserGrowthByMonth(@Param("startDate") LocalDateTime startDate);

    // Specialization distribution
    @Query("SELECT new map(u.specialization as specialization, COUNT(u) as count) " +
            "FROM User u " +
            "WHERE u.role = 'DOCTOR' AND u.specialization IS NOT NULL " +
            "GROUP BY u.specialization")
    List<Map<String, Object>> getSpecializationDistribution();

    // Recent doctors (ordered by creation date)
    @Query("SELECT u FROM User u " +
            "WHERE u.role = 'DOCTOR' " +
            "ORDER BY u.createdAt DESC")
    List<User> getRecentDoctors(Pageable pageable);
}
