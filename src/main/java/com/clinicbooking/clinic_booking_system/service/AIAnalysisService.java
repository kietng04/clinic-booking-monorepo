package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisCreateDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisResponseDto;
import com.clinicbooking.clinic_booking_system.dto.aianalysis.AIAnalysisUpdateDto;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.entity.AIAnalysis;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.AIAnalysisMapper;
import com.clinicbooking.clinic_booking_system.repository.AIAnalysisRepository;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
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
public class AIAnalysisService {
    private final AIAnalysisRepository analysisRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AIAnalysisMapper mapper;

    public AIAnalysisResponseDto create(AIAnalysisCreateDto dto) {
        var familyMember = familyMemberRepository.findById(dto.getFamilyMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", dto.getFamilyMemberId()));

        AIAnalysis analysis = mapper.toEntity(dto);
        analysis.setFamilyMember(familyMember);
        AIAnalysis saved = analysisRepository.save(analysis);
        return mapper.toResponseDto(saved);
    }

    public AIAnalysisResponseDto getById(Long id) {
        return mapper.toResponseDto(findByIdOrThrow(id));
    }

    public PageResponse<AIAnalysisResponseDto> getAllByFamilyMember(Long familyMemberId, int page, int size, String sortBy, String sortDir) {
        familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", familyMemberId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AIAnalysis> page1 = analysisRepository.findByFamilyMemberId(familyMemberId, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<AIAnalysisResponseDto> getByAnalysisType(Long familyMemberId, String analysisType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AIAnalysis> page1 = analysisRepository.findByFamilyMemberIdAndAnalysisType(familyMemberId, analysisType, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<AIAnalysisResponseDto> getBySeverity(AIAnalysis.Severity severity, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AIAnalysis> page1 = analysisRepository.findBySeverity(severity, pageable);
        return buildPageResponse(page1);
    }

    public AIAnalysisResponseDto update(Long id, AIAnalysisUpdateDto dto) {
        AIAnalysis analysis = findByIdOrThrow(id);
        mapper.updateEntity(analysis, dto);
        AIAnalysis updated = analysisRepository.save(analysis);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        analysisRepository.deleteById(id);
    }

    private AIAnalysis findByIdOrThrow(Long id) {
        return analysisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AIAnalysis", "id", id));
    }

    private PageResponse<AIAnalysisResponseDto> buildPageResponse(Page<AIAnalysis> page) {
        List<AIAnalysisResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<AIAnalysisResponseDto>builder()
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
