package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.RoomCreateDto;
import com.clinicbooking.appointmentservice.dto.RoomResponseDto;
import com.clinicbooking.appointmentservice.entity.Room;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private com.clinicbooking.appointmentservice.repository.ClinicRepository clinicRepository;

    private RoomServiceImpl roomService;

    private Room room;
    private RoomCreateDto createDto;

    @BeforeEach
    void setUp() {
        roomService = new RoomServiceImpl(roomRepository, clinicRepository);

        room = Room.builder()
                .id(1L)
                .clinicId(1L)
                .name("Consultation Room 1")
                .roomNumber("C101")
                .type(Room.RoomType.CONSULTATION)
                .capacity(2)
                .isActive(true)
                .build();

        createDto = new RoomCreateDto();
        createDto.setClinicId(1L);
        createDto.setName("Consultation Room 1");
        createDto.setRoomNumber("C101");
        createDto.setType(Room.RoomType.CONSULTATION);
        createDto.setCapacity(2);
    }

    @Test
    void testCreateRoom_Success() {
        // Given
        when(roomRepository.save(any())).thenReturn(room);

        // When
        RoomResponseDto result = roomService.createRoom(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Consultation Room 1");
        verify(roomRepository).save(any());
    }

    @Test
    void testGetRoomById_Success() {
        // Given
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        // When
        RoomResponseDto result = roomService.getRoomById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(roomRepository).findById(1L);
    }

    @Test
    void testGetRoomById_NotFound() {
        // Given
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> roomService.getRoomById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Phòng không tồn tại");
    }

    @Test
    void testGetRoomsByClinic() {
        // Given
        when(roomRepository.findByClinicIdAndIsActiveTrue(1L)).thenReturn(List.of(room));

        // When
        List<RoomResponseDto> result = roomService.getRoomsByClinic(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(roomRepository).findByClinicIdAndIsActiveTrue(1L);
    }

    @Test
    void testGetAllRooms() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Room> roomPage = new PageImpl<>(List.of(room));
        when(roomRepository.findByNameContainingIgnoreCase("consultation", pageable))
                .thenReturn(roomPage);

        // When
        Page<RoomResponseDto> result = roomService.getAllRooms("consultation", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(roomRepository).findByNameContainingIgnoreCase("consultation", pageable);
    }

    @Test
    void testGetAllRooms_NoSearch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Room> roomPage = new PageImpl<>(List.of(room));
        when(roomRepository.findAll(pageable)).thenReturn(roomPage);

        // When
        Page<RoomResponseDto> result = roomService.getAllRooms(null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(roomRepository).findAll(pageable);
    }

    @Test
    void testUpdateRoom_Success() {
        // Given
        RoomCreateDto updateDto = new RoomCreateDto();
        updateDto.setName("Updated Room");
        updateDto.setCapacity(5);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomRepository.save(any())).thenReturn(room);

        // When
        RoomResponseDto result = roomService.updateRoom(1L, updateDto);

        // Then
        assertThat(result).isNotNull();
        verify(roomRepository).findById(1L);
        verify(roomRepository).save(any());
    }

    @Test
    void testUpdateRoom_NotFound() {
        // Given
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> roomService.updateRoom(999L, createDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testDeleteRoom_Success() {
        // Given
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        // When
        roomService.deleteRoom(1L);

        // Then
        verify(roomRepository).findById(1L);
        verify(roomRepository).deleteById(1L);
    }

    @Test
    void testDeleteRoom_NotFound() {
        // Given
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> roomService.deleteRoom(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testToggleRoomStatus_Success() {
        // Given
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomRepository.save(any())).thenReturn(room);

        // When
        roomService.toggleRoomStatus(1L);

        // Then
        verify(roomRepository).findById(1L);
        verify(roomRepository).save(argThat(r -> !r.getIsActive()));
    }

    @Test
    void testToggleRoomStatus_NotFound() {
        // Given
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> roomService.toggleRoomStatus(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
