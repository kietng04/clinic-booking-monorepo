package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.RoomCreateDto;
import com.clinicbooking.appointmentservice.dto.RoomResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {
    RoomResponseDto createRoom(RoomCreateDto dto);

    RoomResponseDto getRoomById(Long id);

    List<RoomResponseDto> getRoomsByClinic(Long clinicId);

    Page<RoomResponseDto> getAllRooms(String name, Pageable pageable);

    RoomResponseDto updateRoom(Long id, RoomCreateDto dto);

    void deleteRoom(Long id);

    void toggleRoomStatus(Long id);
}
