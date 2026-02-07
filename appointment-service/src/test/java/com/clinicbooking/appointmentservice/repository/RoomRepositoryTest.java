package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RoomRepositoryTest {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Room room1;
    private Room room2;
    private Room room3;
    private Room room4;

    @BeforeEach
    void setUp() {
        // Clear all rooms
        roomRepository.deleteAll();

        // Create test rooms
        room1 = Room.builder()
                .clinicId(1L)
                .name("Consultation Room 1")
                .roomNumber("C101")
                .type(Room.RoomType.CONSULTATION)
                .capacity(2)
                .isActive(true)
                .build();

        room2 = Room.builder()
                .clinicId(1L)
                .name("Lab Room")
                .roomNumber("L201")
                .type(Room.RoomType.LAB)
                .capacity(5)
                .isActive(true)
                .build();

        room3 = Room.builder()
                .clinicId(2L)
                .name("Imaging Room")
                .roomNumber("I301")
                .type(Room.RoomType.IMAGING)
                .capacity(3)
                .isActive(false)
                .build();

        room4 = Room.builder()
                .clinicId(1L)
                .name("Procedure Room")
                .roomNumber("P102")
                .type(Room.RoomType.PROCEDURE)
                .capacity(4)
                .isActive(false)
                .build();

        room1 = entityManager.persistAndFlush(room1);
        room2 = entityManager.persistAndFlush(room2);
        room3 = entityManager.persistAndFlush(room3);
        room4 = entityManager.persistAndFlush(room4);
    }

    @Test
    void testFindByClinicId() {
        // When
        List<Room> result = roomRepository.findByClinicId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).extracting(Room::getClinicId)
                .containsOnly(1L);
    }

    @Test
    void testFindByClinicId_NotFound() {
        // When
        List<Room> result = roomRepository.findByClinicId(999L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByClinicIdAndIsActiveTrue() {
        // When
        List<Room> result = roomRepository.findByClinicIdAndIsActiveTrue(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Room::getClinicId).containsOnly(1L);
        assertThat(result).extracting(Room::getIsActive).containsOnly(true);
        assertThat(result).extracting(Room::getName)
                .contains("Consultation Room 1", "Lab Room");
    }

    @Test
    void testFindByClinicIdAndIsActiveTrue_NoActiveRooms() {
        // When
        List<Room> result = roomRepository.findByClinicIdAndIsActiveTrue(2L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty(); // Clinic 2 has no active rooms
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Room> result = roomRepository.findByNameContainingIgnoreCase("room", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(4);
    }

    @Test
    void testFindByNameContainingIgnoreCase_Specific() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Room> result = roomRepository.findByNameContainingIgnoreCase("consultation", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Consultation Room 1");
    }

    @Test
    void testFindByNameContainingIgnoreCase_CaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Room> result = roomRepository.findByNameContainingIgnoreCase("LAB", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Lab Room");
    }

    @Test
    void testFindByNameContainingIgnoreCase_NotFound() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Room> result = roomRepository.findByNameContainingIgnoreCase("NonExistent", pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void testSaveAndFindById() {
        // Given
        Room newRoom = Room.builder()
                .clinicId(3L)
                .name("Emergency Room")
                .roomNumber("E101")
                .type(Room.RoomType.PROCEDURE)
                .capacity(10)
                .isActive(true)
                .build();

        // When
        Room saved = roomRepository.save(newRoom);
        Room found = roomRepository.findById(saved.getId()).orElse(null);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(found).isNotNull();
        assertThat(found.getClinicId()).isEqualTo(3L);
        assertThat(found.getName()).isEqualTo("Emergency Room");
        assertThat(found.getRoomNumber()).isEqualTo("E101");
        assertThat(found.getType()).isEqualTo(Room.RoomType.PROCEDURE);
    }

    @Test
    void testUpdateRoom() {
        // Given
        Room room = room1;
        String newName = "Updated Consultation Room";
        Integer newCapacity = 5;

        // When
        room.setName(newName);
        room.setCapacity(newCapacity);
        Room updated = roomRepository.save(room);

        // Then
        assertThat(updated.getName()).isEqualTo(newName);
        assertThat(updated.getCapacity()).isEqualTo(newCapacity);

        // Verify in database
        Room found = roomRepository.findById(room.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo(newName);
        assertThat(found.getCapacity()).isEqualTo(newCapacity);
    }

    @Test
    void testToggleRoomStatus() {
        // Given
        Room room = room1;
        assertThat(room.getIsActive()).isTrue();

        // When
        room.setIsActive(false);
        Room updated = roomRepository.save(room);

        // Then
        assertThat(updated.getIsActive()).isFalse();

        // Verify in database
        Room found = roomRepository.findById(room.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getIsActive()).isFalse();
    }

    @Test
    void testDeleteRoom() {
        // Given
        Long roomId = room1.getId();

        // When
        roomRepository.deleteById(roomId);
        boolean exists = roomRepository.existsById(roomId);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testFindAll() {
        // When
        List<Room> result = roomRepository.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
    }

    @Test
    void testRoomTypes() {
        // When
        Room consultationRoom = roomRepository.findById(room1.getId()).orElse(null);
        Room labRoom = roomRepository.findById(room2.getId()).orElse(null);
        Room imagingRoom = roomRepository.findById(room3.getId()).orElse(null);
        Room procedureRoom = roomRepository.findById(room4.getId()).orElse(null);

        // Then
        assertThat(consultationRoom).isNotNull();
        assertThat(consultationRoom.getType()).isEqualTo(Room.RoomType.CONSULTATION);

        assertThat(labRoom).isNotNull();
        assertThat(labRoom.getType()).isEqualTo(Room.RoomType.LAB);

        assertThat(imagingRoom).isNotNull();
        assertThat(imagingRoom.getType()).isEqualTo(Room.RoomType.IMAGING);

        assertThat(procedureRoom).isNotNull();
        assertThat(procedureRoom.getType()).isEqualTo(Room.RoomType.PROCEDURE);
    }

    @Test
    void testFindById_NotFound() {
        // When
        var found = roomRepository.findById(999L);

        // Then
        assertThat(found).isEmpty();
    }
}
