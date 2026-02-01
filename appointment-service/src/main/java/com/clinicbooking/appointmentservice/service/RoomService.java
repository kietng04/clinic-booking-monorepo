package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.RoomCreateDto;
import com.clinicbooking.appointmentservice.dto.RoomResponseDto;

import java.util.List;

public interface RoomService {
    RoomResponseDto createRoom(RoomCreateDto dto);
    RoomResponseDto getRoomById(Long id);
    List<RoomResponseDto> getRoomsByClinic(Long clinicId);
    RoomResponseDto updateRoom(Long id, RoomCreateDto dto);
    void deleteRoom(Long id);
    void toggleRoomStatus(Long id);
}
