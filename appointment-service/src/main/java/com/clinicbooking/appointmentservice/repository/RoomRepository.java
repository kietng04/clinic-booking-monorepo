package com.clinicbooking.appointmentservice.repository;

import com.clinicbooking.appointmentservice.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByClinicId(Long clinicId);

    List<Room> findByClinicIdAndIsActiveTrue(Long clinicId);

    Page<Room> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
