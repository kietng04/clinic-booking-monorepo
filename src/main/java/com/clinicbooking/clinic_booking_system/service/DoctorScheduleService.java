package com.clinicbooking.clinic_booking_system.service;

import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleCreateDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleResponseDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.DoctorSchedule;
import com.clinicbooking.clinic_booking_system.entity.User;
import com.clinicbooking.clinic_booking_system.exception.BadRequestException;
import com.clinicbooking.clinic_booking_system.exception.ResourceNotFoundException;
import com.clinicbooking.clinic_booking_system.mapper.DoctorScheduleMapper;
import com.clinicbooking.clinic_booking_system.repository.DoctorScheduleRepository;
import com.clinicbooking.clinic_booking_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorScheduleService {
    private final DoctorScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final DoctorScheduleMapper mapper;

    public DoctorScheduleResponseDto create(DoctorScheduleCreateDto dto) {
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDoctorId()));

        if (!doctor.isDoctor()) {
            throw new BadRequestException("User không phải là bác sĩ");
        }

        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BadRequestException("Giờ bắt đầu phải trước giờ kết thúc");
        }

        if (scheduleRepository.hasOverlappingSchedule(
                dto.getDoctorId(), dto.getDayOfWeek(),
                dto.getStartTime(), dto.getEndTime(), null)) {
            throw new BadRequestException("Lịch làm việc bị trùng với lịch đã tồn tại");
        }

        DoctorSchedule schedule = mapper.toEntity(dto);
        schedule.setDoctor(doctor);
        DoctorSchedule saved = scheduleRepository.save(schedule);
        return mapper.toResponseDto(saved);
    }

    public DoctorScheduleResponseDto getById(Long id) {
        DoctorSchedule schedule = findByIdOrThrow(id);
        return mapper.toResponseDto(schedule);
    }

    public List<DoctorScheduleResponseDto> getAllByDoctor(Long doctorId) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorId));

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorId(doctorId);
        return mapper.toResponseDtoList(schedules);
    }

    public List<DoctorScheduleResponseDto> getAvailableByDay(Integer dayOfWeek) {
        List<DoctorSchedule> schedules = scheduleRepository.findAvailableDoctorsByDay(dayOfWeek);
        return mapper.toResponseDtoList(schedules);
    }

    public DoctorScheduleResponseDto update(Long id, DoctorScheduleUpdateDto dto) {
        DoctorSchedule schedule = findByIdOrThrow(id);

        java.time.LocalTime newStart = dto.getStartTime() != null ? dto.getStartTime() : schedule.getStartTime();
        java.time.LocalTime newEnd = dto.getEndTime() != null ? dto.getEndTime() : schedule.getEndTime();

        if (!newStart.isBefore(newEnd)) {
            throw new BadRequestException("Giờ bắt đầu phải trước giờ kết thúc");
        }

        if (dto.getStartTime() != null || dto.getEndTime() != null) {
            if (scheduleRepository.hasOverlappingSchedule(
                    schedule.getDoctor().getId(), schedule.getDayOfWeek(),
                    newStart, newEnd, schedule.getId())) {
                throw new BadRequestException("Lịch làm việc bị trùng với lịch đã tồn tại");
            }
        }

        mapper.updateEntity(schedule, dto);
        DoctorSchedule updated = scheduleRepository.save(schedule);
        return mapper.toResponseDto(updated);
    }

    public void delete(Long id) {
        DoctorSchedule schedule = findByIdOrThrow(id);
        scheduleRepository.delete(schedule);
    }

    private DoctorSchedule findByIdOrThrow(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", id));
    }
}
