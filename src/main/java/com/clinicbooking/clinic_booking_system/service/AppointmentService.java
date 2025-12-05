package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentCreateDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentResponseDto;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentSearchCriteria;
import com.clinicbooking.clinic_booking_system.dto.appointment.AppointmentUpdateDto;
import com.clinicbooking.clinic_booking_system.dto.common.PageResponse;
import com.clinicbooking.clinic_booking_system.dto.notification.NotificationCreateDto;
import com.clinicbooking.clinic_booking_system.entity.Appointment;
import com.clinicbooking.clinic_booking_system.entity.FamilyMember;
import com.clinicbooking.clinic_booking_system.entity.Notification;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.AppointmentMapper;
import com.clinicbooking.clinic_booking_system.repository.AppointmentRepository;
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
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AppointmentMapper mapper;
    private final NotificationService notificationService;

    public AppointmentResponseDto create(AppointmentCreateDto dto) {
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getPatientId()));

        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDoctorId()));

        if (!doctor.isDoctor()) {
            throw new BadRequestException("Người được chỉ định không phải là bác sĩ");
        }

        if (dto.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(dto.getFamilyMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", dto.getFamilyMemberId()));
            if (familyMember.getIsDeleted()) {
                throw new BadRequestException("Thành viên gia đình không tồn tại");
            }
        }

        LocalDateTime appointmentDateTime = LocalDateTime.of(dto.getAppointmentDate(), dto.getAppointmentTime());
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ngày hẹn phải trong tương lai");
        }

        Appointment appointment = mapper.toEntity(dto);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        if (dto.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(dto.getFamilyMemberId()).get();
            appointment.setFamilyMember(familyMember);
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Create notification for doctor
        notificationService.create(NotificationCreateDto.builder()
                .userId(doctor.getId())
                .type(Notification.NotificationType.APPOINTMENT)
                .title("Lịch hẹn mới")
                .message("Bệnh nhân " + patient.getFullName() + " đã đặt lịch hẹn")
                .relatedId(saved.getId())
                .relatedType("Appointment")
                .build());

        return mapper.toResponseDto(saved);
    }

    public AppointmentResponseDto getById(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        return mapper.toResponseDto(appointment);
    }

    public PageResponse<AppointmentResponseDto> getAllByPatient(Long patientId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Appointment> appointmentPage = appointmentRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(appointmentPage);
    }

    public PageResponse<AppointmentResponseDto> getAllByDoctor(Long doctorId, int page, int size, String sortBy, String sortDir) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorId));

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Appointment> appointmentPage = appointmentRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(appointmentPage);
    }

    public AppointmentResponseDto update(Long id, AppointmentUpdateDto dto) {
        Appointment appointment = findByIdOrThrow(id);
        mapper.updateEntity(appointment, dto);
        Appointment updated = appointmentRepository.save(appointment);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        if (!appointment.canBeCancelled()) {
            throw new BadRequestException("Không thể hủy lịch hẹn này");
        }
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public AppointmentResponseDto confirm(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể xác nhận lịch hẹn chưa xác nhận");
        }
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        Appointment updated = appointmentRepository.save(appointment);

        notificationService.create(NotificationCreateDto.builder()
                .userId(appointment.getPatient().getId())
                .type(Notification.NotificationType.APPOINTMENT)
                .title("Lịch hẹn được xác nhận")
                .message("Bác sĩ " + appointment.getDoctor().getFullName() + " đã xác nhận lịch hẹn của bạn")
                .relatedId(id)
                .relatedType("Appointment")
                .build());

        return mapper.toResponseDto(updated);
    }

    public AppointmentResponseDto complete(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        Appointment updated = appointmentRepository.save(appointment);

        notificationService.create(NotificationCreateDto.builder()
                .userId(appointment.getPatient().getId())
                .type(Notification.NotificationType.APPOINTMENT)
                .title("Lịch hẹn đã hoàn thành")
                .message("Lịch hẹn với bác sĩ " + appointment.getDoctor().getFullName() + " đã hoàn thành")
                .relatedId(id)
                .relatedType("Appointment")
                .build());

        return mapper.toResponseDto(updated);
    }

    public AppointmentResponseDto cancel(Long id, String reason) {
        Appointment appointment = findByIdOrThrow(id);
        if (!appointment.canBeCancelled()) {
            throw new BadRequestException("Không thể hủy lịch hẹn này");
        }
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        Appointment updated = appointmentRepository.save(appointment);

        notificationService.create(NotificationCreateDto.builder()
                .userId(appointment.getDoctor().getId())
                .type(Notification.NotificationType.APPOINTMENT)
                .title("Lịch hẹn bị hủy")
                .message("Lịch hẹn với bệnh nhân " + appointment.getPatient().getFullName() + " đã bị hủy")
                .relatedId(id)
                .relatedType("Appointment")
                .build());

        return mapper.toResponseDto(updated);
    }

    public PageResponse<AppointmentResponseDto> search(AppointmentSearchCriteria criteria, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Appointment> appointmentPage = appointmentRepository.searchAppointments(
                criteria.getPatientId(),
                criteria.getDoctorId(),
                criteria.getStatus(),
                criteria.getType(),
                criteria.getStartDate(),
                criteria.getEndDate(),
                pageable);

        return buildPageResponse(appointmentPage);
    }

    private Appointment findByIdOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    private PageResponse<AppointmentResponseDto> buildPageResponse(Page<Appointment> page) {
        List<AppointmentResponseDto> content = mapper.toResponseDtoList(page.getContent());
        return PageResponse.<AppointmentResponseDto>builder()
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
