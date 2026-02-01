package com.clinicbooking.appointmentservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", indexes = {
        @Index(name = "idx_patient_id", columnList = "patient_id"),
        @Index(name = "idx_doctor_id", columnList = "doctor_id"),
        @Index(name = "idx_date_status", columnList = "appointment_date, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // References to User Service (no JPA relationships)
    @Column(name = "patient_id", nullable = false)
    @NotNull(message = "Bệnh nhân không được để trống")
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    @NotNull(message = "Bác sĩ không được để trống")
    private Long doctorId;

    // Denormalized data from User Service (for performance)
    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "patient_phone")
    private String patientPhone;

    // Reference to family member (optional)
    @Column(name = "family_member_id")
    private Long familyMemberId;

    @Column(name = "family_member_name")
    private String familyMemberName;

    @Column(name = "appointment_date", nullable = false)
    @NotNull(message = "Ngày khám không được để trống")
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    @NotNull(message = "Giờ khám không được để trống")
    private LocalTime appointmentTime;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AppointmentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;


    @Column(name = "clinic_id")
    private Long clinicId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "service_fee", precision = 10, scale = 2)
    private BigDecimal serviceFee;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AppointmentType {
        IN_PERSON,
        ONLINE
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }

    public enum Priority {
        NORMAL,
        URGENT
    }

    public boolean isUpcoming() {
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointmentDate, appointmentTime);
        return appointmentDateTime.isAfter(LocalDateTime.now())
                && (status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED);
    }

    public boolean isPast() {
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointmentDate, appointmentTime);
        return appointmentDateTime.isBefore(LocalDateTime.now());
    }

    public boolean canBeCancelled() {
        return status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED;
    }
}
