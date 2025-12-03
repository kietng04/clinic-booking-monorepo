package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.DoctorScheduleCreateDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleResponseDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorScheduleService {

    DoctorScheduleResponseDto createSchedule(DoctorScheduleCreateDto dto);

    DoctorScheduleResponseDto getScheduleById(Long id);

    List<DoctorScheduleResponseDto> getSchedulesByDoctorId(Long doctorId);

    List<DoctorScheduleResponseDto> getSchedulesByDoctorIdAndDay(Long doctorId, Integer dayOfWeek);

    Page<DoctorScheduleResponseDto> getAllSchedules(Pageable pageable);

    DoctorScheduleResponseDto updateSchedule(Long id, DoctorScheduleUpdateDto dto);

    void deleteSchedule(Long id);
}
