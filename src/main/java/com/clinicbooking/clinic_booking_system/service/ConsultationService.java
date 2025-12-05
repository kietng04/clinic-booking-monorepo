package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationCreateDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationResponseDto;
import com.clinicbooking.clinic_booking_system.dto.consultation.ConsultationUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Consultation;
import com.clinicbooking.clinic_booking_system.entity.FamilyMember;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.ConsultationMapper;
import com.clinicbooking.clinic_booking_system.repository.ConsultationRepository;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
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
public class ConsultationService {
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final ConsultationMapper mapper;

    public ConsultationResponseDto create(ConsultationCreateDto dto) {
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getPatientId()));

        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDoctorId()));

        if (dto.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(dto.getFamilyMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", dto.getFamilyMemberId()));
            if (familyMember.getIsDeleted()) {
                throw new BadRequestException("Thành viên gia đình không tồn tại");
            }
        }

        Consultation consultation = mapper.toEntity(dto);
        consultation.setPatient(patient);
        consultation.setDoctor(doctor);
        if (dto.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(dto.getFamilyMemberId()).get();
            consultation.setFamilyMember(familyMember);
        }

        Consultation saved = consultationRepository.save(consultation);
        return mapper.toResponseDto(saved);
    }

    public ConsultationResponseDto getById(Long id) {
        Consultation consultation = findByIdOrThrow(id);
        return mapper.toResponseDto(consultation);
    }

    public PageResponse<ConsultationResponseDto> getAllByPatient(Long patientId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Consultation> consultationPage = consultationRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(consultationPage);
    }

    public PageResponse<ConsultationResponseDto> getAllByDoctor(Long doctorId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Consultation> consultationPage = consultationRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(consultationPage);
    }

    public ConsultationResponseDto update(Long id, ConsultationUpdateDto dto) {
        Consultation consultation = findByIdOrThrow(id);
        mapper.updateEntity(consultation, dto);
        Consultation updated = consultationRepository.save(consultation);
        return mapper.toResponseDto(updated);
    }

    public ConsultationResponseDto start(Long id) {
        Consultation consultation = findByIdOrThrow(id);

        List<Consultation> activeForDoctor = consultationRepository.findByDoctorIdAndStatus(
                consultation.getDoctor().getId(), Consultation.ConsultationStatus.ACTIVE);
        if (!activeForDoctor.isEmpty()) {
            throw new BadRequestException("Bác sĩ đang có tư vấn khác đang diễn ra");
        }

        consultation.setStatus(Consultation.ConsultationStatus.ACTIVE);
        consultation.setStartedAt(LocalDateTime.now());
        Consultation updated = consultationRepository.save(consultation);
        return mapper.toResponseDto(updated);
    }

    public ConsultationResponseDto end(Long id) {
        Consultation consultation = findByIdOrThrow(id);
        consultation.setStatus(Consultation.ConsultationStatus.COMPLETED);
        consultation.setEndedAt(LocalDateTime.now());
        Consultation updated = consultationRepository.save(consultation);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        Consultation consultation = findByIdOrThrow(id);
        if (consultation.getStatus() == Consultation.ConsultationStatus.ACTIVE) {
            throw new BadRequestException("Không thể xóa tư vấn đang diễn ra");
        }
        consultationRepository.delete(consultation);
    }

    private Consultation findByIdOrThrow(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));
    }

    private PageResponse<ConsultationResponseDto> buildPageResponse(Page<Consultation> page) {
        List<ConsultationResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<ConsultationResponseDto>builder()
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
