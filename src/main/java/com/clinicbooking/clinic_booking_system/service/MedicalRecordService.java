package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordCreateDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordResponseDto;
import com.clinicbooking.clinic_booking_system.dto.medicalrecord.MedicalRecordUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.MedicalRecord;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.MedicalRecordMapper;
import com.clinicbooking.clinic_booking_system.repository.AppointmentRepository;
import com.clinicbooking.clinic_booking_system.repository.FamilyMemberRepository;
import com.clinicbooking.clinic_booking_system.repository.MedicalRecordRepository;
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
public class MedicalRecordService {
    private final MedicalRecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final MedicalRecordMapper mapper;

    public MedicalRecordResponseDto create(MedicalRecordCreateDto dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", dto.getAppointmentId()));

        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Chỉ có thể tạo hồ sơ từ cuộc hẹn đã hoàn thành");
        }

        if (recordRepository.findByAppointmentId(dto.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Hồ sơ y tế cho cuộc hẹn này đã tồn tại");
        }

        var familyMember = familyMemberRepository.findById(dto.getFamilyMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", dto.getFamilyMemberId()));

        var doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDoctorId()));

        MedicalRecord record = mapper.toEntity(dto);
        record.setAppointment(appointment);
        record.setFamilyMember(familyMember);
        record.setDoctor(doctor);
        MedicalRecord saved = recordRepository.save(record);
        return mapper.toResponseDto(saved);
    }

    public MedicalRecordResponseDto getById(Long id) {
        return mapper.toResponseDto(findByIdOrThrow(id));
    }

    public MedicalRecordResponseDto getByAppointment(Long appointmentId) {
        var record = recordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "appointmentId", appointmentId));
        return mapper.toResponseDto(record);
    }

    public PageResponse<MedicalRecordResponseDto> getAllByFamilyMember(Long familyMemberId, int page, int size, String sortBy, String sortDir) {
        familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", familyMemberId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<MedicalRecord> page1 = recordRepository.findByFamilyMemberId(familyMemberId, pageable);
        return buildPageResponse(page1);
    }

    public PageResponse<MedicalRecordResponseDto> getAllByDoctor(Long doctorId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<MedicalRecord> page1 = recordRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(page1);
    }

    public MedicalRecordResponseDto update(Long id, MedicalRecordUpdateDto dto) {
        MedicalRecord record = findByIdOrThrow(id);
        mapper.updateEntity(record, dto);
        MedicalRecord updated = recordRepository.save(record);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        recordRepository.deleteById(id);
    }

    private MedicalRecord findByIdOrThrow(Long id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", id));
    }

    private PageResponse<MedicalRecordResponseDto> buildPageResponse(Page<MedicalRecord> page) {
        List<MedicalRecordResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<MedicalRecordResponseDto>builder()
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
