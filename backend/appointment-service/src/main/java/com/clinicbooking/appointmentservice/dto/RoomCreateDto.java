package com.clinicbooking.appointmentservice.dto;

import com.clinicbooking.appointmentservice.entity.Room;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCreateDto {
    @NotNull(message = "ID phòng khám không được để trống")
    private Long clinicId;

    @NotBlank(message = "Tên phòng không được để trống")
    private String name;

    private String roomNumber;
    private Room.RoomType type;
    private Integer capacity;
}
