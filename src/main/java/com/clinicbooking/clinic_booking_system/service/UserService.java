package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.user.UserCreateDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserResponseDto;
import com.clinicbooking.clinic_booking_system.dto.user.UserSearchCriteria;
import com.clinicbooking.clinic_booking_system.dto.user.UserUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.UserMapper;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // CREATE
    public UserResponseDto createUser(UserCreateDto dto) {
        // Validate unique email and phone
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }
        if (dto.getPhone() != null && userRepository.existsByPhone(dto.getPhone())) {
            throw new BadRequestException("Số điện thoại đã tồn tại");
        }

        // Validate doctor-specific fields
        if (dto.getRole() == User.UserRole.DOCTOR) {
            validateDoctorFields(dto);
        }

        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        User saved = userRepository.save(user);
        return userMapper.toResponseDto(saved);
    }

    // READ
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return userMapper.toResponseDto(user);
    }

    public PageResponse<UserResponseDto> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> userPage = userRepository.findAll(pageable);
        return buildPageResponse(userPage);
    }

    // UPDATE
    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Validate phone uniqueness if changed
        if (dto.getPhone() != null && !dto.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(dto.getPhone())) {
                throw new BadRequestException("Số điện thoại đã tồn tại");
            }
        }

        userMapper.updateEntity(user, dto);
        User updated = userRepository.save(user);
        return userMapper.toResponseDto(updated);
    }

    // DELETE (soft delete)
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    // SEARCH/FILTER
    public PageResponse<UserResponseDto> searchUsers(
            UserSearchCriteria criteria, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> userPage = userRepository.searchUsers(
                criteria.getEmail(),
                criteria.getPhone(),
                criteria.getFullName(),
                criteria.getRole(),
                criteria.getIsActive(),
                pageable);

        return buildPageResponse(userPage);
    }

    public PageResponse<UserResponseDto> searchDoctors(
            String specialization, BigDecimal minRating, BigDecimal maxFee,
            int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> userPage = userRepository.searchDoctors(
                User.UserRole.DOCTOR,
                specialization,
                minRating,
                maxFee,
                pageable);

        return buildPageResponse(userPage);
    }

    // Helper methods
    private void validateDoctorFields(UserCreateDto dto) {
        if (dto.getSpecialization() == null || dto.getSpecialization().isBlank()) {
            throw new BadRequestException("Chuyên khoa không được để trống cho bác sĩ");
        }
        if (dto.getLicenseNumber() == null || dto.getLicenseNumber().isBlank()) {
            throw new BadRequestException("Số giấy phép hành nghề không được để trống cho bác sĩ");
        }
    }

    private PageResponse<UserResponseDto> buildPageResponse(Page<User> page) {
        List<UserResponseDto> content = userMapper.toResponseDtoList(page.getContent());
        return PageResponse.<UserResponseDto>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();
    }
}
