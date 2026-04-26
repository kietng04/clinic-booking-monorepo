package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.DoctorScheduleCreateDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleResponseDto;
import com.clinicbooking.appointmentservice.dto.DoctorScheduleUpdateDto;
import com.clinicbooking.appointmentservice.dto.UserDto;
import com.clinicbooking.appointmentservice.entity.DoctorSchedule;
import com.clinicbooking.appointmentservice.exception.ResourceNotFoundException;
import com.clinicbooking.appointmentservice.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceTest {

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @Mock
    private com.clinicbooking.appointmentservice.mapper.DoctorScheduleMapper doctorScheduleMapper;

    @Mock
    private com.clinicbooking.appointmentservice.client.UserServiceClient userServiceClient;

    private DoctorScheduleServiceImpl doctorScheduleService;

    private DoctorSchedule schedule;
    private DoctorScheduleCreateDto createDto;
    private DoctorScheduleUpdateDto updateDto;

    @BeforeEach
    void setUp() {
        doctorScheduleService = new DoctorScheduleServiceImpl(doctorScheduleRepository, doctorScheduleMapper, userServiceClient);

        schedule = DoctorSchedule.builder()
                .id(1L)
                .doctorId(1L)
                .doctorName("Dr. Smith")
                .dayOfWeek(1)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .isAvailable(true)
                .build();

        createDto = new DoctorScheduleCreateDto();
        createDto.setDoctorId(1L);
        createDto.setDayOfWeek(1);
        createDto.setStartTime(LocalTime.of(9, 0));
        createDto.setEndTime(LocalTime.of(17, 0));

        updateDto = new DoctorScheduleUpdateDto();
        updateDto.setDayOfWeek(2);
        updateDto.setStartTime(LocalTime.of(10, 0));
        updateDto.setEndTime(LocalTime.of(18, 0));
        updateDto.setIsAvailable(false);

        lenient().when(userServiceClient.getUserById(1L)).thenReturn(UserDto.builder()
                .id(1L)
                .fullName("Dr. Smith")
                .role("DOCTOR")
                .isActive(true)
                .build());
        lenient().when(doctorScheduleMapper.toEntity(any(DoctorScheduleCreateDto.class)))
                .thenAnswer(invocation -> {
                    DoctorScheduleCreateDto dto = invocation.getArgument(0);
                    return DoctorSchedule.builder()
                            .doctorId(dto.getDoctorId())
                            .dayOfWeek(dto.getDayOfWeek())
                            .startTime(dto.getStartTime())
                            .endTime(dto.getEndTime())
                            .isAvailable(dto.getIsAvailable())
                            .build();
                });
        lenient().when(doctorScheduleMapper.toDto(any(DoctorSchedule.class)))
                .thenAnswer(invocation -> {
                    DoctorSchedule s = invocation.getArgument(0);
                    return DoctorScheduleResponseDto.builder()
                            .id(s.getId())
                            .doctorId(s.getDoctorId())
                            .doctorName(s.getDoctorName())
                            .dayOfWeek(s.getDayOfWeek())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .isAvailable(s.getIsAvailable())
                            .build();
                });
    }

    @Test
    void testCreateSchedule_Success() {
        // Given
        when(doctorScheduleRepository.save(any())).thenReturn(schedule);

        // When
        DoctorScheduleResponseDto result = doctorScheduleService.createSchedule(createDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getDoctorId()).isEqualTo(1L);
        verify(doctorScheduleRepository).save(any());
    }

    @Test
    void testGetScheduleById_Success() {
        // Given
        when(doctorScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        // When
        DoctorScheduleResponseDto result = doctorScheduleService.getScheduleById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(doctorScheduleRepository).findById(1L);
    }

    @Test
    void testGetScheduleById_NotFound() {
        // Given
        when(doctorScheduleRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> doctorScheduleService.getScheduleById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Lịch làm việc không tồn tại");
    }

    @Test
    void testGetSchedulesByDoctorId() {
        // Given
        when(doctorScheduleRepository.findByDoctorId(1L)).thenReturn(List.of(schedule));

        // When
        List<DoctorScheduleResponseDto> result = doctorScheduleService.getSchedulesByDoctorId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDoctorId()).isEqualTo(1L);
        verify(doctorScheduleRepository).findByDoctorId(1L);
    }

    @Test
    void testGetSchedulesByDoctorIdAndDay() {
        // Given
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(1L, 1))
                .thenReturn(List.of(schedule));

        // When
        List<DoctorScheduleResponseDto> result = doctorScheduleService
                .getSchedulesByDoctorIdAndDay(1L, 1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDayOfWeek()).isEqualTo(1);
        verify(doctorScheduleRepository).findByDoctorIdAndDayOfWeek(1L, 1);
    }

    @Test
    void testGetAllSchedules() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<DoctorSchedule> schedulePage = new PageImpl<>(List.of(schedule));
        when(doctorScheduleRepository.findAll(pageable)).thenReturn(schedulePage);

        // When
        Page<DoctorScheduleResponseDto> result = doctorScheduleService.getAllSchedules(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(doctorScheduleRepository).findAll(pageable);
    }

    @Test
    void testUpdateSchedule_Success() {
        // Given
        when(doctorScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(doctorScheduleRepository.save(any())).thenReturn(schedule);

        // When
        DoctorScheduleResponseDto result = doctorScheduleService.updateSchedule(1L, updateDto);

        // Then
        assertThat(result).isNotNull();
        verify(doctorScheduleRepository).findById(1L);
        verify(doctorScheduleRepository).save(any());
    }

    @Test
    void testUpdateSchedule_NotFound() {
        // Given
        when(doctorScheduleRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> doctorScheduleService.updateSchedule(999L, updateDto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testUpdateSchedule_PartialUpdate() {
        // Given
        DoctorScheduleUpdateDto partialUpdate = new DoctorScheduleUpdateDto();
        partialUpdate.setIsAvailable(false);

        when(doctorScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(doctorScheduleRepository.save(any())).thenReturn(schedule);

        // When
        DoctorScheduleResponseDto result = doctorScheduleService.updateSchedule(1L, partialUpdate);

        // Then
        assertThat(result).isNotNull();
        verify(doctorScheduleRepository).save(argThat(s -> !s.getIsAvailable()));
    }

    @Test
    void testDeleteSchedule_Success() {
        // Given
        when(doctorScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        // When
        doctorScheduleService.deleteSchedule(1L);

        // Then
        verify(doctorScheduleRepository).findById(1L);
        verify(doctorScheduleRepository).deleteById(1L);
    }

    @Test
    void testDeleteSchedule_NotFound() {
        // Given
        when(doctorScheduleRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> doctorScheduleService.deleteSchedule(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testGetSchedulesByDoctorId_Empty() {
        // Given
        when(doctorScheduleRepository.findByDoctorId(999L)).thenReturn(List.of());

        // When
        List<DoctorScheduleResponseDto> result = doctorScheduleService.getSchedulesByDoctorId(999L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void testGetSchedulesByDoctorIdAndDay_Empty() {
        // Given
        when(doctorScheduleRepository.findByDoctorIdAndDayOfWeek(1L, 5))
                .thenReturn(List.of());

        // When
        List<DoctorScheduleResponseDto> result = doctorScheduleService
                .getSchedulesByDoctorIdAndDay(1L, 5);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }
}
