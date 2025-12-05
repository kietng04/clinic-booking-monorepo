package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricCreateDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricResponseDto;
import com.clinicbooking.clinic_booking_system.dto.healthmetric.HealthMetricUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.HealthMetric;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.HealthMetricMapper;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
import com.clinicbooking.clinic_booking_system.repository.HealthMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class HealthMetricService {
    private final HealthMetricRepository metricRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final HealthMetricMapper mapper;

    public HealthMetricResponseDto create(HealthMetricCreateDto dto) {
        var familyMember = familyMemberRepository.findById(dto.getFamilyMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", dto.getFamilyMemberId()));

        HealthMetric metric = mapper.toEntity(dto);
        metric.setFamilyMember(familyMember);
        HealthMetric saved = metricRepository.save(metric);
        return mapper.toResponseDto(saved);
    }

    public HealthMetricResponseDto getById(Long id) {
        return mapper.toResponseDto(findByIdOrThrow(id));
    }

    public PageResponse<HealthMetricResponseDto> getAllByFamilyMember(Long familyMemberId, int page, int size, String sortBy, String sortDir) {
        familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", familyMemberId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<HealthMetric> page1 = metricRepository.findByFamilyMemberId(familyMemberId, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<HealthMetricResponseDto> getByMetricType(Long familyMemberId, String metricType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthMetric> page1 = metricRepository.findByFamilyMemberIdAndMetricType(familyMemberId, metricType, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<HealthMetricResponseDto> getByDateRange(Long familyMemberId, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthMetric> page1 = metricRepository.findByFamilyMemberIdAndMeasuredAtBetween(familyMemberId, startDate, endDate, pageable);
        return buildPageResponse(page1);
    }

    public HealthMetricResponseDto update(Long id, HealthMetricUpdateDto dto) {
        HealthMetric metric = findByIdOrThrow(id);
        mapper.updateEntity(metric, dto);
        HealthMetric updated = metricRepository.save(metric);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        metricRepository.deleteById(id);
    }

    private HealthMetric findByIdOrThrow(Long id) {
        return metricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HealthMetric", "id", id));
    }

    private PageResponse<HealthMetricResponseDto> buildPageResponse(Page<HealthMetric> page) {
        List<HealthMetricResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<HealthMetricResponseDto>builder()
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
