package com.clinicbooking.userservice.service;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FamilyMemberService {

    FamilyMemberResponseDto createFamilyMember(FamilyMemberCreateDto dto);

    FamilyMemberResponseDto getFamilyMemberById(Long id);

    List<FamilyMemberResponseDto> getFamilyMembersByUserId(Long userId);

    Page<FamilyMemberResponseDto> getAllFamilyMembers(Pageable pageable);

    FamilyMemberResponseDto updateFamilyMember(Long id, FamilyMemberUpdateDto dto);

    void deleteFamilyMember(Long id);
}
