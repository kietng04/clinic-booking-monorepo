package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.clinic_booking_system.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.FamilyMember;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.FamilyMemberMapper;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FamilyMemberService {
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final FamilyMemberMapper mapper;

    public FamilyMemberResponseDto create(FamilyMemberCreateDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getUserId()));

        FamilyMember member = mapper.toEntity(dto);
        member.setUser(user);
        FamilyMember saved = familyMemberRepository.save(member);
        return mapper.toResponseDto(saved);
    }

    public FamilyMemberResponseDto getById(Long id) {
        FamilyMember member = findByIdOrThrow(id);
        return mapper.toResponseDto(member);
    }

    public PageResponse<FamilyMemberResponseDto> getAllByUser(Long userId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<FamilyMember> memberPage = familyMemberRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
        return buildPageResponse(memberPage);
    }

    public FamilyMemberResponseDto update(Long id, FamilyMemberUpdateDto dto) {
        FamilyMember member = findByIdOrThrow(id);
        mapper.updateEntity(member, dto);
        FamilyMember updated = familyMemberRepository.save(member);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        FamilyMember member = findByIdOrThrow(id);
        member.setIsDeleted(true);
        familyMemberRepository.save(member);
    }

    public PageResponse<FamilyMemberResponseDto> search(
            Long userId, String fullName, String relationship, String gender,
            int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        User.Gender genderEnum = null;
        if (gender != null) {
            try {
                genderEnum = User.Gender.valueOf(gender);
            } catch (IllegalArgumentException e) {
                genderEnum = null;
            }
        }

        Page<FamilyMember> memberPage = familyMemberRepository.searchByUser(
                userId, fullName, relationship, genderEnum, pageable);
        return buildPageResponse(memberPage);
    }

    private FamilyMember findByIdOrThrow(Long id) {
        return familyMemberRepository.findById(id)
                .filter(fm -> !fm.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", id));
    }

    private PageResponse<FamilyMemberResponseDto> buildPageResponse(Page<FamilyMember> page) {
        List<FamilyMemberResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<FamilyMemberResponseDto>builder()
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
