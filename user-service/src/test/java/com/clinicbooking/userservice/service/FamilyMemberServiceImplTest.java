package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.userservice.entity.FamilyMember;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.exception.ResourceNotFoundException;
import com.clinicbooking.userservice.mapper.FamilyMemberMapper;
import com.clinicbooking.userservice.repository.FamilyMemberRepository;
import com.clinicbooking.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FamilyMemberServiceImplTest {

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyMemberMapper familyMemberMapper;

    @InjectMocks
    private FamilyMemberServiceImpl familyMemberService;

    private User testUser;
    private FamilyMember testMember;
    private FamilyMemberCreateDto createDto;
    private FamilyMemberUpdateDto updateDto;
    private FamilyMemberResponseDto responseDto;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .role(User.UserRole.PATIENT)
                .isActive(true)
                .build();

        testMember = FamilyMember.builder()
                .id(1L)
                .user(testUser)
                .fullName("Jane Doe")
                .relationship("Wife")
                .dateOfBirth(LocalDate.of(1985, 5, 15))
                .gender(User.Gender.FEMALE)
                .isDeleted(false)
                .build();

        createDto = FamilyMemberCreateDto.builder()
                .userId(1L)
                .fullName("Jane Doe")
                .relationship("Wife")
                .dateOfBirth(LocalDate.of(1985, 5, 15))
                .gender(User.Gender.FEMALE)
                .build();

        updateDto = FamilyMemberUpdateDto.builder()
                .fullName("Jane Smith")
                .relationship("Spouse")
                .build();

        responseDto = FamilyMemberResponseDto.builder()
                .id(1L)
                .userId(1L)
                .fullName("Jane Doe")
                .relationship("Wife")
                .build();
    }

    @Test
    void createFamilyMember_withValidData_createsMember() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(familyMemberMapper.toEntity(any(FamilyMemberCreateDto.class))).thenReturn(testMember);
        when(familyMemberRepository.save(any(FamilyMember.class))).thenReturn(testMember);
        when(familyMemberMapper.toDto(any(FamilyMember.class))).thenReturn(responseDto);

        // Act
        FamilyMemberResponseDto result = familyMemberService.createFamilyMember(createDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getFullName()).isEqualTo("Jane Doe");
        verify(userRepository).findById(1L);
        verify(familyMemberRepository).save(any(FamilyMember.class));
    }

    @Test
    void createFamilyMember_withNonExistentUser_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.createFamilyMember(createDto))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(familyMemberRepository, never()).save(any());
    }

    @Test
    void getFamilyMemberById_withValidId_returnsMember() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));
        when(familyMemberMapper.toDto(any(FamilyMember.class))).thenReturn(responseDto);

        // Act
        FamilyMemberResponseDto result = familyMemberService.getFamilyMemberById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(familyMemberRepository).findById(1L);
    }

    @Test
    void getFamilyMemberById_withNonExistentId_throwsException() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.getFamilyMemberById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFamilyMemberById_withDeletedMember_throwsException() {
        // Arrange
        testMember.setIsDeleted(true);
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.getFamilyMemberById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFamilyMembersByUserId_withValidUserId_returnsList() {
        // Arrange
        List<FamilyMember> members = Arrays.asList(testMember);
        when(userRepository.existsById(anyLong())).thenReturn(true);
        when(familyMemberRepository.findByUserIdAndIsDeletedFalse(anyLong())).thenReturn(members);
        when(familyMemberMapper.toDtoList(anyList())).thenReturn(Arrays.asList(responseDto));

        // Act
        List<FamilyMemberResponseDto> result = familyMemberService.getFamilyMembersByUserId(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFullName()).isEqualTo("Jane Doe");
        verify(familyMemberRepository).findByUserIdAndIsDeletedFalse(1L);
    }

    @Test
    void getFamilyMembersByUserId_withNonExistentUser_throwsException() {
        // Arrange
        when(userRepository.existsById(anyLong())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.getFamilyMembersByUserId(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(familyMemberRepository, never()).findByUserIdAndIsDeletedFalse(anyLong());
    }

    @Test
    void getAllFamilyMembers_withPagination_returnsPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<FamilyMember> page = new PageImpl<>(Arrays.asList(testMember));
        when(familyMemberRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(familyMemberMapper.toDto(any(FamilyMember.class))).thenReturn(responseDto);

        // Act
        Page<FamilyMemberResponseDto> result = familyMemberService.getAllFamilyMembers(pageable);

        // Assert
        assertThat(result.getContent()).hasSize(1);
        verify(familyMemberRepository).findAll(pageable);
    }

    @Test
    void updateFamilyMember_withValidData_updatesMember() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));
        when(familyMemberRepository.save(any(FamilyMember.class))).thenReturn(testMember);
        when(familyMemberMapper.toDto(any(FamilyMember.class))).thenReturn(responseDto);

        // Act
        FamilyMemberResponseDto result = familyMemberService.updateFamilyMember(1L, updateDto);

        // Assert
        assertThat(result).isNotNull();
        verify(familyMemberMapper).updateEntityFromDto(updateDto, testMember);
        verify(familyMemberRepository).save(testMember);
    }

    @Test
    void updateFamilyMember_withNonExistentId_throwsException() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.updateFamilyMember(999L, updateDto))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(familyMemberRepository, never()).save(any());
    }

    @Test
    void updateFamilyMember_withDeletedMember_throwsException() {
        // Arrange
        testMember.setIsDeleted(true);
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.updateFamilyMember(1L, updateDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteFamilyMember_withValidId_softDeletesMember() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));
        when(familyMemberRepository.save(any(FamilyMember.class))).thenReturn(testMember);

        // Act
        familyMemberService.deleteFamilyMember(1L);

        // Assert
        assertThat(testMember.getIsDeleted()).isTrue();
        verify(familyMemberRepository).save(testMember);
    }

    @Test
    void deleteFamilyMember_withNonExistentId_throwsException() {
        // Arrange
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.deleteFamilyMember(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(familyMemberRepository, never()).save(any());
    }

    @Test
    void deleteFamilyMember_withAlreadyDeletedMember_throwsException() {
        // Arrange
        testMember.setIsDeleted(true);
        when(familyMemberRepository.findById(anyLong())).thenReturn(Optional.of(testMember));

        // Act & Assert
        assertThatThrownBy(() -> familyMemberService.deleteFamilyMember(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
