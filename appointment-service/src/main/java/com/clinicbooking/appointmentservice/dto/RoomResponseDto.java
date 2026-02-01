package com.clinicbooking.appointmentservice.dto;

import com.clinicbooking.appointmentservice.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponseDto {
    private Long id;
    private Long clinicId;
    private String name;
    private String roomNumber;
    private Room.RoomType type;
    private Integer capacity;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
