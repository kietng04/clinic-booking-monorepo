package com.clinicbooking.clinic_booking_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Bác sĩ không được để trống")
    private User doctor;

    @Column(name = "day_of_week", nullable = false)
    @Min(value = 0, message = "Ngày trong tuần phải từ 0-6")
    @Max(value = 6, message = "Ngày trong tuần phải từ 0-6")
    @NotNull(message = "Ngày trong tuần không được để trống")
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public DayOfWeek getDayOfWeekEnum() {
        return DayOfWeek.of(dayOfWeek == 0 ? 7 : dayOfWeek);
    }

    public String getDayOfWeekVietnamese() {
        return switch (dayOfWeek) {
            case 0 -> "Chủ nhật";
            case 1 -> "Thứ hai";
            case 2 -> "Thứ ba";
            case 3 -> "Thứ tư";
            case 4 -> "Thứ năm";
            case 5 -> "Thứ sáu";
            case 6 -> "Thứ bảy";
            default -> "Unknown";
        };
    }

    public boolean isWorkingNow() {
        LocalTime now = LocalTime.now();
        LocalDateTime nowDateTime = LocalDateTime.now();
        int currentDayOfWeek = nowDateTime.getDayOfWeek().getValue() % 7;
        return Boolean.TRUE.equals(isAvailable)
                && dayOfWeek == currentDayOfWeek
                && now.isAfter(startTime)
                && now.isBefore(endTime);
    }

    public int getDurationMinutes() {
        return (int) Duration.between(startTime, endTime).toMinutes();
    }
}
