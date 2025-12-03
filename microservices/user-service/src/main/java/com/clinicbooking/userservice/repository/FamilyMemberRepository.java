package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.FamilyMember;
import com.clinicbooking.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    // Find by user
    Page<FamilyMember> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    List<FamilyMember> findByUserIdAndIsDeletedFalse(Long userId);

    // Count by user
    long countByUserIdAndIsDeletedFalse(Long userId);

    // Search
    @Query("SELECT fm FROM FamilyMember fm WHERE fm.user.id = :userId " +
            "AND fm.isDeleted = false " +
            "AND (:fullName IS NULL OR LOWER(fm.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
            "AND (:relationship IS NULL OR LOWER(fm.relationship) LIKE LOWER(CONCAT('%', :relationship, '%'))) " +
            "AND (:gender IS NULL OR fm.gender = :gender)")
    Page<FamilyMember> searchByUser(
            @Param("userId") Long userId,
            @Param("fullName") String fullName,
            @Param("relationship") String relationship,
            @Param("gender") User.Gender gender,
            Pageable pageable);

    // Find with health conditions
    @Query("SELECT fm FROM FamilyMember fm WHERE fm.isDeleted = false " +
            "AND (fm.allergies IS NOT NULL OR fm.chronicDiseases IS NOT NULL)")
    List<FamilyMember> findWithHealthConditions();
}
