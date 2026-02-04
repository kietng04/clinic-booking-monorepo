package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.RoomCreateDto;
import com.clinicbooking.appointmentservice.dto.RoomResponseDto;
import com.clinicbooking.appointmentservice.entity.Clinic;
import com.clinicbooking.appointmentservice.entity.Room;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.ClinicRepository;
import com.clinicbooking.appointmentservice.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ClinicRepository clinicRepository;

    @Override
    @Transactional
    public RoomResponseDto createRoom(RoomCreateDto dto) {
        clinicRepository.findById(dto.getClinicId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng khám không tìm thấy"));
        Room room = Room.builder()
                .clinicId(dto.getClinicId())
                .name(dto.getName())
                .roomNumber(dto.getRoomNumber())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .isActive(true)
                .build();
        room = roomRepository.save(room);
        log.info("Created room {} in clinic {}", room.getName(), room.getClinicId());
        return mapToResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponseDto getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tìm thấy"));
        return mapToResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDto> getRoomsByClinic(Long clinicId) {
        return roomRepository.findByClinicIdAndIsActiveTrue(clinicId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponseDto> getAllRooms(String name, Pageable pageable) {
        Page<Room> page = roomRepository.findByNameContainingIgnoreCase(name, pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public RoomResponseDto updateRoom(Long id, RoomCreateDto dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tìm thấy"));
        room.setName(dto.getName());
        room.setRoomNumber(dto.getRoomNumber());
        room.setType(dto.getType());
        room.setCapacity(dto.getCapacity());
        return mapToResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tìm thấy"));
        roomRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleRoomStatus(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tìm thấy"));
        room.setIsActive(!room.getIsActive());
        roomRepository.save(room);
    }

    private RoomResponseDto mapToResponse(Room room) {
        return RoomResponseDto.builder()
                .id(room.getId())
                .clinicId(room.getClinicId())
                .name(room.getName())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .capacity(room.getCapacity())
                .isActive(room.getIsActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
