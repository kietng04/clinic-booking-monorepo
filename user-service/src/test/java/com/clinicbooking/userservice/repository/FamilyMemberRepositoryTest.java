package com.clinicbooking.userservice.repository;

import com.clinicbooking.userservice.entity.FamilyMember;
import com.clinicbooking.userservice.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class FamilyMemberRepositoryTest {

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testUser;
    private FamilyMember member1;
    private FamilyMember member2;
    private FamilyMember member3;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("patient@test.com")
                .password("password123")
                .fullName("John Doe")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();
        entityManager.persistAndFlush(testUser);

        member1 = FamilyMember.builder()
                .user(testUser)
                .fullName("Jane Doe")
                .relationship("Wife")
                .dateOfBirth(LocalDate.of(1985, 5, 15))
                .gender(User.Gender.FEMALE)
                .allergies("Penicillin")
                .isDeleted(false)
                .build();
        entityManager.persistAndFlush(member1);

        member2 = FamilyMember.builder()
                .user(testUser)
                .fullName("Jimmy Doe")
                .relationship("Son")
                .dateOfBirth(LocalDate.of(2010, 8, 20))
                .gender(User.Gender.MALE)
                .chronicDiseases("Asthma")
                .isDeleted(false)
                .build();
        entityManager.persistAndFlush(member2);

        member3 = FamilyMember.builder()
                .user(testUser)
                .fullName("Sarah Doe")
                .relationship("Daughter")
                .dateOfBirth(LocalDate.of(2015, 3, 10))
                .gender(User.Gender.FEMALE)
                .isDeleted(true) // Soft deleted
                .build();
        entityManager.persistAndFlush(member3);

        entityManager.clear();
    }

    @Test
    void findByUserIdAndIsDeletedFalse_returnsList() {
        // Act
        List<FamilyMember> members = familyMemberRepository.findByUserIdAndIsDeletedFalse(testUser.getId());

        // Assert
        assertThat(members).hasSize(2);
        assertThat(members).extracting(FamilyMember::getFullName)
                .containsExactlyInAnyOrder("Jane Doe", "Jimmy Doe");
    }

    @Test
    void findByUserIdAndIsDeletedFalse_withPagination_returnsPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> page = familyMemberRepository.findByUserIdAndIsDeletedFalse(testUser.getId(), pageable);

        // Assert
        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    @Test
    void findByUserIdAndIsDeletedFalse_excludesSoftDeleted() {
        // Act
        List<FamilyMember> members = familyMemberRepository.findByUserIdAndIsDeletedFalse(testUser.getId());

        // Assert
        assertThat(members).noneMatch(m -> m.getFullName().equals("Sarah Doe"));
    }

    @Test
    void countByUserIdAndIsDeletedFalse_returnsCorrectCount() {
        // Act
        long count = familyMemberRepository.countByUserIdAndIsDeletedFalse(testUser.getId());

        // Assert
        assertThat(count).isEqualTo(2);
    }

    @Test
    void searchByUser_withFullName_findsMatch() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> result = familyMemberRepository.searchByUser(
                testUser.getId(), "Jane", null, null, pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Jane Doe");
    }

    @Test
    void searchByUser_withRelationship_filtersCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> result = familyMemberRepository.searchByUser(
                testUser.getId(), null, "Son", null, pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getRelationship()).isEqualTo("Son");
    }

    @Test
    void searchByUser_withGender_filtersCorrectly() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> result = familyMemberRepository.searchByUser(
                testUser.getId(), null, null, User.Gender.MALE, pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getGender()).isEqualTo(User.Gender.MALE);
    }

    @Test
    void searchByUser_withAllFilters_appliesAllCriteria() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> result = familyMemberRepository.searchByUser(
                testUser.getId(), "Jane", "Wife", User.Gender.FEMALE, pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Jane Doe");
    }

    @Test
    void searchByUser_caseInsensitive_findsMatch() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<FamilyMember> result = familyMemberRepository.searchByUser(
                testUser.getId(), "jane", null, null, pageable
        );

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Jane Doe");
    }

    @Test
    void findWithHealthConditions_returnsOnlyMembersWithConditions() {
        // Act
        List<FamilyMember> members = familyMemberRepository.findWithHealthConditions();

        // Assert
        assertThat(members).hasSize(2);
        assertThat(members).allMatch(m ->
                m.getAllergies() != null || m.getChronicDiseases() != null
        );
    }

    @Test
    void findByUserIdAndIsDeletedFalse_emptyForNonExistentUser() {
        // Act
        List<FamilyMember> members = familyMemberRepository.findByUserIdAndIsDeletedFalse(999L);

        // Assert
        assertThat(members).isEmpty();
    }
}
