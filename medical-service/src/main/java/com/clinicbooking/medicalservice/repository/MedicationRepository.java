package com.clinicbooking.medicalservice.repository;

import com.clinicbooking.medicalservice.entity.Medication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {

    // Find all active medications
    List<Medication> findByIsActiveTrueOrderByNameAsc();

    // Find by category
    List<Medication> findByCategoryAndIsActiveTrueOrderByNameAsc(String category);

    // Search by name or generic name (case-insensitive)
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY m.name ASC")
    List<Medication> searchByNameOrGenericName(@Param("search") String search);

    // Paginated search
    @Query("SELECT m FROM Medication m WHERE " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:isActive IS NULL OR m.isActive = :isActive)")
    Page<Medication> findWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    // Get distinct categories
    @Query("SELECT DISTINCT m.category FROM Medication m WHERE m.category IS NOT NULL ORDER BY m.category")
    List<String> findDistinctCategories();

    // Check if name exists
    boolean existsByNameIgnoreCase(String name);
}
