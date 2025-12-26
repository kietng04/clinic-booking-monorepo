package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.dto.user.UserUpdateDto;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.event.UserEventPublisher;
import com.clinicbooking.userservice.mapper.UserMapper;
import com.clinicbooking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDto> getUsersByRole(String role) {
        log.info("Fetching users by role: {}", role);
        Page<User> usersPage = userRepository.findByRole(
                User.UserRole.valueOf(role),
                Pageable.unpaged()
        );
        return userMapper.toDtoList(usersPage.getContent());
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        log.info("Updating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Update basic fields
        if (dto.getEmail() != null) {
            // Check if email is already taken by another user
            if (userRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
                throw new RuntimeException("Email đã tồn tại");
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            // Check if phone is already taken by another user
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), id)) {
                throw new RuntimeException("Số điện thoại đã tồn tại");
            }
            user.setPhone(dto.getPhone());
        }
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());

        // Update doctor-specific fields
        if (user.isDoctor()) {
            // Validate that doctors cannot clear required fields
            if (dto.getSpecialization() != null) {
                if (dto.getSpecialization().isBlank()) {
                    throw new RuntimeException("Chuyên khoa không được để trống cho bác sĩ");
                }
                user.setSpecialization(dto.getSpecialization());
            }
            if (dto.getLicenseNumber() != null) {
                if (dto.getLicenseNumber().isBlank()) {
                    throw new RuntimeException("Số giấy phép hành nghề không được để trống cho bác sĩ");
                }
                user.setLicenseNumber(dto.getLicenseNumber());
            }
            if (dto.getWorkplace() != null) user.setWorkplace(dto.getWorkplace());
            if (dto.getExperienceYears() != null) {
                if (dto.getExperienceYears() < 0) {
                    throw new RuntimeException("Số năm kinh nghiệm không được âm");
                }
                user.setExperienceYears(dto.getExperienceYears());
            }
            if (dto.getConsultationFee() != null) {
                if (dto.getConsultationFee().signum() < 0) {
                    throw new RuntimeException("Phí tư vấn không được âm");
                }
                user.setConsultationFee(dto.getConsultationFee());
            }
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        // Publish update event
        eventPublisher.publishUserUpdated(user);

        log.info("User updated successfully: {}", id);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Soft deleting user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Soft delete - set isActive to false instead of hard delete
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Publish delete event for other services to handle
        eventPublisher.publishUserDeleted(user.getId());

        log.info("User soft deleted successfully: {}", id);
    }
}
