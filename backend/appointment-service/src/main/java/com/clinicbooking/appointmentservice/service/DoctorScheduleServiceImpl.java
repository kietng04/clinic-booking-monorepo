package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.client.UserServiceClient;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleCreateDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleResponseDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleUpdateDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.mapper.DoctorScheduleMapper;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorScheduleMapper scheduleMapper;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public DoctorScheduleResponseDto createSchedule(DoctorScheduleCreateDto dto) {
        log.info("Creating schedule for doctor: doctorId={}", dto.getDoctorId());

        // Fetch doctor data from User Service
        UserDto doctor = userServiceClient.getUserById(dto.getDoctorId());
        if (doctor == null) {
            throw new ResourceNotFoundException("Bác sĩ không tồn tại");
        }

        // Validate doctor role
        if (!"DOCTOR".equals(doctor.getRole())) {
            throw new RuntimeException("Người dùng không phải là bác sĩ");
        }

        // Check if schedule already exists for this day
        if (scheduleRepository.existsByDoctorIdAndDayOfWeek(dto.getDoctorId(), dto.getDayOfWeek())) {
            throw new RuntimeException("Lịch làm việc cho ngày này đã tồn tại");
        }

        // Create schedule
        DoctorSchedule schedule = scheduleMapper.toEntity(dto);
        schedule.setDoctorName(doctor.getFullName());

        if (dto.getIsAvailable() == null) {
            schedule.setIsAvailable(true);
        }

        schedule = scheduleRepository.save(schedule);

        return scheduleMapper.toDto(schedule);
    }

    @Override
    public DoctorScheduleResponseDto getScheduleById(Long id) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch làm việc không tồn tại"));
        return scheduleMapper.toDto(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleResponseDto> getSchedulesByDoctorId(Long doctorId) {
        log.info("Fetching schedules for doctor ID: {}", doctorId);
        return scheduleRepository.findByDoctorId(doctorId).stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleResponseDto> getSchedulesByDoctorIdAndDay(Long doctorId, Integer dayOfWeek) {
        log.info("Fetching schedules for doctor ID: {} on day: {}", doctorId, dayOfWeek);
        return scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek).stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorScheduleResponseDto> getAllSchedules(Pageable pageable) {
        log.info("Fetching all schedules with pagination");
        return scheduleRepository.findAll(pageable)
                .map(scheduleMapper::toDto);
    }

    @Override
    @Transactional
    public DoctorScheduleResponseDto updateSchedule(Long id, DoctorScheduleUpdateDto dto) {
        log.info("Updating schedule with ID: {}", id);

        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch làm việc không tồn tại"));

        if (dto.getDayOfWeek() != null) schedule.setDayOfWeek(dto.getDayOfWeek());
        if (dto.getStartTime() != null) schedule.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) schedule.setEndTime(dto.getEndTime());
        if (dto.getIsAvailable() != null) schedule.setIsAvailable(dto.getIsAvailable());

        schedule = scheduleRepository.save(schedule);
        log.info("Schedule updated successfully: {}", id);

        return scheduleMapper.toDto(schedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lịch làm việc không tồn tại");
        }
        scheduleRepository.deleteById(id);
    }
}
