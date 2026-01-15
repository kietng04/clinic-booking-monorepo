package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.AppointmentCreateDto;
import com.clinicbooking.appointmentservice.dto.AppointmentResponseDto;
import com.clinicbooking.appointmentservice.dto.AppointmentUpdateDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.entity.Appointment;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import com.clinicbooking.appointmentservice.event.AppointmentEventPublisher;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.exception.ValidationException;
import com.clinicbooking.appointmentservice.mapper.AppointmentMapper;
import com.clinicbooking.appointmentservice.repository.AppointmentRepository;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentEventPublisher eventPublisher;
    private final UserServiceClient userServiceClient;

    private static final int DEFAULT_DURATION_MINUTES = 30;
    private static final int MIN_DURATION_MINUTES = 15;
    private static final int MAX_DURATION_MINUTES = 180;

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentCreateDto dto) {
        log.info("Creating appointment: patientId={}, doctorId={}", dto.getPatientId(), dto.getDoctorId());

        // Validate and set duration
        int durationMinutes = dto.getDurationMinutes() != null ? dto.getDurationMinutes() : DEFAULT_DURATION_MINUTES;
        if (durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
            throw new ValidationException("Thời gian khám phải từ " + MIN_DURATION_MINUTES + " đến " + MAX_DURATION_MINUTES + " phút");
        }

        // Validate appointment is in the future (service level validation)
        LocalDateTime appointmentDateTime = LocalDateTime.of(dto.getAppointmentDate(), dto.getAppointmentTime());
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new ValidationException("Không thể đặt lịch trong quá khứ");
        }

        // Validate appointment is not too far in the future (e.g., max 3 months)
        if (dto.getAppointmentDate().isAfter(LocalDate.now().plusMonths(3))) {
            throw new ValidationException("Không thể đặt lịch quá 3 tháng trước");
        }

        // Validate doctor's schedule
        validateDoctorSchedule(dto.getDoctorId(), dto.getAppointmentDate(), dto.getAppointmentTime(), durationMinutes);

        // Check for overlapping appointments (considering duration)
        LocalTime endTime = dto.getAppointmentTime().plusMinutes(durationMinutes);
        if (appointmentRepository.hasOverlappingAppointmentNative(
                dto.getDoctorId(), dto.getAppointmentDate(), dto.getAppointmentTime(), endTime)) {
            throw new ValidationException("Khung giờ này đã bị trùng với lịch hẹn khác");
        }

        // Fetch user data from User Service
        UserDto patient = userServiceClient.getUserById(dto.getPatientId());
        UserDto doctor = userServiceClient.getUserById(dto.getDoctorId());

        // Validate doctor role
        if (!"DOCTOR".equals(doctor.getRole())) {
            throw new ValidationException("Người dùng không phải là bác sĩ");
        }

        // Create appointment
        Appointment appointment = appointmentMapper.toEntity(dto);
        appointment.setPatientName(patient.getFullName());
        appointment.setDoctorName(doctor.getFullName());
        appointment.setPatientPhone(patient.getPhone());
        appointment.setDurationMinutes(durationMinutes);

        // Set enums
        if (dto.getType() != null) {
            appointment.setType(Appointment.AppointmentType.valueOf(dto.getType()));
        }
        if (dto.getPriority() != null) {
            appointment.setPriority(Appointment.Priority.valueOf(dto.getPriority()));
        }

        appointment = appointmentRepository.save(appointment);

        // Publish event
        eventPublisher.publishAppointmentCreated(appointment);

        return appointmentMapper.toDto(appointment);
    }

    @Override
    public AppointmentResponseDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(Long id, AppointmentUpdateDto dto) {
        log.info("Updating appointment: id={}", id);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        // Cannot update completed or cancelled appointments
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED ||
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new ValidationException("Không thể cập nhật lịch hẹn đã hoàn thành hoặc đã hủy");
        }

        boolean dateTimeChanged = false;

        // Update appointment date and time if provided
        if (dto.getAppointmentDate() != null && dto.getAppointmentTime() != null) {
            LocalDateTime newAppointmentDateTime = LocalDateTime.of(dto.getAppointmentDate(), dto.getAppointmentTime());

            // Validate appointment is in the future
            if (newAppointmentDateTime.isBefore(LocalDateTime.now())) {
                throw new ValidationException("Không thể đặt lịch trong quá khứ");
            }

            // Validate appointment is not too far in the future
            if (dto.getAppointmentDate().isAfter(LocalDate.now().plusMonths(3))) {
                throw new ValidationException("Không thể đặt lịch quá 3 tháng trước");
            }

            dateTimeChanged = !appointment.getAppointmentDate().equals(dto.getAppointmentDate()) ||
                    !appointment.getAppointmentTime().equals(dto.getAppointmentTime());
        }

        // Update duration if provided
        int durationMinutes = dto.getDurationMinutes() != null ? dto.getDurationMinutes() : appointment.getDurationMinutes();
        if (dto.getDurationMinutes() != null) {
            if (durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
                throw new ValidationException("Thời gian khám phải từ " + MIN_DURATION_MINUTES + " đến " + MAX_DURATION_MINUTES + " phút");
            }
            appointment.setDurationMinutes(durationMinutes);
            dateTimeChanged = true;
        }

        // If date or time changed, validate doctor's schedule and check for overlaps
        if (dateTimeChanged) {
            LocalDate appointmentDate = dto.getAppointmentDate() != null ? dto.getAppointmentDate() : appointment.getAppointmentDate();
            LocalTime appointmentTime = dto.getAppointmentTime() != null ? dto.getAppointmentTime() : appointment.getAppointmentTime();

            // Skip validation if same date and time
            boolean isSameDateTime = appointment.getAppointmentDate().equals(appointmentDate) &&
                    appointment.getAppointmentTime().equals(appointmentTime) &&
                    appointment.getDurationMinutes().equals(durationMinutes);

            if (!isSameDateTime) {
                validateDoctorSchedule(appointment.getDoctorId(), appointmentDate, appointmentTime, durationMinutes);

                // Check for overlapping appointments
                LocalTime endTime = appointmentTime.plusMinutes(durationMinutes);
                boolean hasOverlap = appointmentRepository.hasOverlappingAppointmentNative(
                        appointment.getDoctorId(), appointmentDate, appointmentTime, endTime);

                if (hasOverlap) {
                    // Additional check: if overlap exists, ensure it's not the current appointment
                    List<Appointment> sameTimeSlot = appointmentRepository.findByDoctorIdAndAppointmentDate(
                            appointment.getDoctorId(), appointmentDate);

                    boolean hasConflictWithOther = sameTimeSlot.stream()
                            .anyMatch(a -> !a.getId().equals(id) &&
                                    (a.getStatus() == Appointment.AppointmentStatus.PENDING ||
                                     a.getStatus() == Appointment.AppointmentStatus.CONFIRMED) &&
                                    a.getAppointmentTime().isBefore(endTime) &&
                                    a.getAppointmentTime().plusMinutes(a.getDurationMinutes()).isAfter(appointmentTime));

                    if (hasConflictWithOther) {
                        throw new ValidationException("Khung giờ này đã bị trùng với lịch hẹn khác");
                    }
                }
            }

            appointment.setAppointmentDate(appointmentDate);
            appointment.setAppointmentTime(appointmentTime);
        }

        // Update other fields
        if (dto.getType() != null) {
            appointment.setType(Appointment.AppointmentType.valueOf(dto.getType()));
        }
        if (dto.getSymptoms() != null) {
            appointment.setSymptoms(dto.getSymptoms());
        }
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        if (dto.getPriority() != null) {
            appointment.setPriority(Appointment.Priority.valueOf(dto.getPriority()));
        }

        appointment = appointmentRepository.save(appointment);

        // Publish event
        eventPublisher.publishAppointmentUpdated(appointment);

        log.info("Appointment updated successfully: id={}", id);
        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        log.info("Deleting appointment: id={}", id);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        // Soft delete by cancelling instead of hard delete
        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new ValidationException("Lịch hẹn đã bị hủy");
        }

        // For completed appointments, we can still "delete" them by cancelling
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancelReason("Đã xóa bởi hệ thống");
        appointmentRepository.save(appointment);

        // Publish event
        eventPublisher.publishAppointmentCancelled(appointment);

        log.info("Appointment deleted successfully: id={}", id);
    }

    @Override
    public Page<AppointmentResponseDto> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable)
                .map(appointmentMapper::toDto);
    }

    @Override
    public Page<AppointmentResponseDto> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable)
                .map(appointmentMapper::toDto);
    }

    @Override
    @Transactional
    public AppointmentResponseDto confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new ValidationException("Chỉ có thể xác nhận lịch hẹn đang chờ");
        }

        // Cannot confirm past appointments
        if (appointment.isPast()) {
            throw new ValidationException("Không thể xác nhận lịch hẹn đã qua");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);

        eventPublisher.publishAppointmentUpdated(appointment);

        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDto cancelAppointment(Long id, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (!appointment.canBeCancelled()) {
            throw new ValidationException("Không thể hủy lịch hẹn này");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointment = appointmentRepository.save(appointment);

        eventPublisher.publishAppointmentCancelled(appointment);

        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDto completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new ValidationException("Chỉ có thể hoàn thành lịch hẹn đã xác nhận");
        }

        // Cannot complete future appointments
        if (appointment.isUpcoming()) {
            throw new ValidationException("Không thể hoàn thành lịch hẹn chưa đến giờ");
        }

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        eventPublisher.publishAppointmentUpdated(appointment);

        return appointmentMapper.toDto(appointment);
    }

    @Override
    public Page<AppointmentResponseDto> searchAppointments(
            Long patientId, Long doctorId, String status,
            LocalDate fromDate, LocalDate toDate, Pageable pageable) {

        Appointment.AppointmentStatus statusEnum = status != null ?
                Appointment.AppointmentStatus.valueOf(status) : null;

        return appointmentRepository.searchAppointments(
                patientId, doctorId, statusEnum, fromDate, toDate, pageable)
                .map(appointmentMapper::toDto);
    }

    private void validateDoctorSchedule(Long doctorId, LocalDate date, LocalTime startTime, int durationMinutes) {
        // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;

        // Find doctor's schedule for this day
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);

        if (schedules.isEmpty()) {
            throw new ValidationException("Bác sĩ không làm việc vào ngày này");
        }

        LocalTime endTime = startTime.plusMinutes(durationMinutes);

        // Check if appointment time falls within any of the doctor's working hours
        boolean withinSchedule = schedules.stream()
                .filter(schedule -> Boolean.TRUE.equals(schedule.getIsAvailable()))
                .anyMatch(schedule ->
                    !startTime.isBefore(schedule.getStartTime()) &&
                    !endTime.isAfter(schedule.getEndTime())
                );

        if (!withinSchedule) {
            throw new ValidationException("Thời gian khám nằm ngoài giờ làm việc của bác sĩ");
        }
    }
}
