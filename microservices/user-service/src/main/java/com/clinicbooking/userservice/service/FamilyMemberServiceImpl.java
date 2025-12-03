package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.userservice.entity.FamilyMember;
import com.clinicbooking.userservice.entity.User;
import com.clinicbooking.userservice.mapper.FamilyMemberMapper;
import com.clinicbooking.userservice.repository.FamilyMemberRepository;
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
public class FamilyMemberServiceImpl implements FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final FamilyMemberMapper familyMemberMapper;

    @Override
    @Transactional
    public FamilyMemberResponseDto createFamilyMember(FamilyMemberCreateDto dto) {
        log.info("Creating family member for user ID: {}", dto.getUserId());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        FamilyMember familyMember = familyMemberMapper.toEntity(dto);
        familyMember.setUser(user);

        familyMember = familyMemberRepository.save(familyMember);
        log.info("Family member created with ID: {}", familyMember.getId());

        return familyMemberMapper.toDto(familyMember);
    }

    @Override
    @Transactional(readOnly = true)
    public FamilyMemberResponseDto getFamilyMemberById(Long id) {
        log.info("Fetching family member with ID: {}", id);
        FamilyMember familyMember = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên gia đình"));
        return familyMemberMapper.toDto(familyMember);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FamilyMemberResponseDto> getFamilyMembersByUserId(Long userId) {
        log.info("Fetching family members for user ID: {}", userId);
        List<FamilyMember> familyMembers = familyMemberRepository.findByUserIdAndIsDeletedFalse(userId);
        return familyMemberMapper.toDtoList(familyMembers);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FamilyMemberResponseDto> getAllFamilyMembers(Pageable pageable) {
        log.info("Fetching all family members with pagination");
        Page<FamilyMember> familyMembers = familyMemberRepository.findAll(pageable);
        return familyMembers.map(familyMemberMapper::toDto);
    }

    @Override
    @Transactional
    public FamilyMemberResponseDto updateFamilyMember(Long id, FamilyMemberUpdateDto dto) {
        log.info("Updating family member with ID: {}", id);

        FamilyMember familyMember = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên gia đình"));

        familyMemberMapper.updateEntityFromDto(dto, familyMember);
        familyMember.setUpdatedAt(LocalDateTime.now());

        familyMember = familyMemberRepository.save(familyMember);
        log.info("Family member updated successfully: {}", id);

        return familyMemberMapper.toDto(familyMember);
    }

    @Override
    @Transactional
    public void deleteFamilyMember(Long id) {
        log.info("Soft deleting family member with ID: {}", id);

        FamilyMember familyMember = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên gia đình"));

        // Soft delete - set isDeleted flag instead of hard delete
        familyMember.setIsDeleted(true);
        familyMember.setUpdatedAt(LocalDateTime.now());
        familyMemberRepository.save(familyMember);

        log.info("Family member soft deleted successfully: {}", id);
    }
}
