package com.clinicbooking.appointmentservice.controller;

import com.clinicbooking.appointmentservice.dto.RoomCreateDto;
import com.clinicbooking.appointmentservice.dto.RoomResponseDto;
import com.clinicbooking.appointmentservice.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<Page<RoomResponseDto>> getAllRooms(
            @RequestParam(defaultValue = "") String name,
            Pageable pageable) {
        return ResponseEntity.ok(roomService.getAllRooms(name, pageable));
    }

    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<RoomResponseDto>> getRoomsByClinic(@PathVariable Long clinicId) {
        return ResponseEntity.ok(roomService.getRoomsByClinic(clinicId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDto> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping
    public ResponseEntity<RoomResponseDto> createRoom(@Valid @RequestBody RoomCreateDto dto) {
        RoomResponseDto room = roomService.createRoom(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponseDto> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomCreateDto dto) {
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleRoomStatus(@PathVariable Long id) {
        roomService.toggleRoomStatus(id);
        return ResponseEntity.ok().build();
    }
}
