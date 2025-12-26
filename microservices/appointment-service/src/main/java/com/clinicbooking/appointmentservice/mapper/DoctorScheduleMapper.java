package com.clinicbooking.appointmentservice.mapper;

import com.clinicbooking.appointmentservice.dto.DoctorScheduleCreateDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleResponseDto;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DoctorScheduleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    DoctorSchedule toEntity(DoctorScheduleCreateDto dto);

    @Mapping(target = "dayOfWeekVietnamese", expression = "java(schedule.getDayOfWeekVietnamese())")
    @Mapping(target = "durationMinutes", expression = "java(schedule.getDurationMinutes())")
    DoctorScheduleResponseDto toDto(DoctorSchedule schedule);
}
