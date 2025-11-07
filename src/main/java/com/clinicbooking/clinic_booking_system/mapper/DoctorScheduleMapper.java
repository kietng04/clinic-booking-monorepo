package com.clinicbooking.clinic_booking_system.mapper;

import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleCreateDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleResponseDto;
import com.clinicbooking.clinic_booking_system.dto.schedule.DoctorScheduleUpdateDto;
import com.clinicbooking.clinic_booking_system.entity.DoctorSchedule;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DoctorScheduleMapper {
    private static final String[] VIETNAMESE_DAYS = {"Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"};

    public DoctorSchedule toEntity(DoctorScheduleCreateDto dto) {
        return DoctorSchedule.builder()
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .build();
    }

    public void updateEntity(DoctorSchedule schedule, DoctorScheduleUpdateDto dto) {
        if (dto.getStartTime() != null) schedule.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) schedule.setEndTime(dto.getEndTime());
        if (dto.getIsAvailable() != null) schedule.setIsAvailable(dto.getIsAvailable());
    }

    public DoctorScheduleResponseDto toResponseDto(DoctorSchedule schedule) {
        Integer durationMinutes = null;
        if (schedule.getStartTime() != null && schedule.getEndTime() != null) {
            durationMinutes = (int) java.time.temporal.ChronoUnit.MINUTES.between(
                    schedule.getStartTime(), schedule.getEndTime());
        }

        return DoctorScheduleResponseDto.builder()
                .id(schedule.getId())
                .doctorId(schedule.getDoctor().getId())
                .doctorName(schedule.getDoctor().getFullName())
                .doctorSpecialization(schedule.getDoctor().getSpecialization())
                .dayOfWeek(schedule.getDayOfWeek())
                .dayOfWeekVietnamese(VIETNAMESE_DAYS[schedule.getDayOfWeek()])
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .isAvailable(schedule.getIsAvailable())
                .durationMinutes(durationMinutes)
                .createdAt(schedule.getCreatedAt())
                .build();
    }

    public List<DoctorScheduleResponseDto> toResponseDtoList(List<DoctorSchedule> schedules) {
        return schedules.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
