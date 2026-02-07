package com.clinicbooking.userservice.controller;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = WebSecurityConfigurer.class
        ),
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    private Page<UserResponseDto> mockDoctorPage;
    private UserResponseDto doctor1;
    private UserResponseDto doctor2;

    @BeforeEach
    void setUp() {
        doctor1 = UserResponseDto.builder()
                .id(1L)
                .email("doctor1@test.com")
                .fullName("Dr. Sarah Johnson")
                .role("DOCTOR")
                .specialization("Cardiology")
                .rating(BigDecimal.valueOf(4.5))
                .consultationFee(BigDecimal.valueOf(500000))
                .experienceYears(10)
                .workplace("City Hospital")
                .isActive(true)
                .build();

        doctor2 = UserResponseDto.builder()
                .id(2L)
                .email("doctor2@test.com")
                .fullName("Dr. Michael Chen")
                .role("DOCTOR")
                .specialization("Dermatology")
                .rating(BigDecimal.valueOf(4.8))
                .consultationFee(BigDecimal.valueOf(700000))
                .experienceYears(8)
                .workplace("Central Clinic")
                .isActive(true)
                .build();

        mockDoctorPage = new PageImpl<>(
                Arrays.asList(doctor1, doctor2),
                PageRequest.of(0, 12),
                2
        );
    }

    @Test
    void searchDoctors_withAllParams_returns200() throws Exception {
        // Arrange
        when(userService.searchDoctors(
                anyString(),
                anyString(),
                any(BigDecimal.class),
                any(BigDecimal.class),
                any(Pageable.class)
        )).thenReturn(mockDoctorPage);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("keyword", "sarah")
                        .param("specialization", "Cardiology")
                        .param("minRating", "4.0")
                        .param("maxFee", "1000000")
                        .param("page", "0")
                        .param("size", "12")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].fullName").value("Dr. Sarah Johnson"))
                .andExpect(jsonPath("$.content[0].specialization").value("Cardiology"))
                .andExpect(jsonPath("$.content[0].rating").value(4.5))
                .andExpect(jsonPath("$.content[0].consultationFee").value(500000))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.size").value(12));

        // Verify service was called with correct parameters
        verify(userService).searchDoctors(
                eq("sarah"),
                eq("Cardiology"),
                eq(BigDecimal.valueOf(4.0)),
                eq(BigDecimal.valueOf(1000000)),
                any(Pageable.class)
        );
    }

    @Test
    void searchDoctors_withKeywordOnly_returns200() throws Exception {
        // Arrange
        Page<UserResponseDto> singleDoctorPage = new PageImpl<>(
                Collections.singletonList(doctor1)
        );
        when(userService.searchDoctors(
                anyString(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(singleDoctorPage);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("keyword", "Sarah")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].fullName").value("Dr. Sarah Johnson"));

        verify(userService).searchDoctors(
                eq("Sarah"),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    void searchDoctors_withNoParams_returns200() throws Exception {
        // Arrange
        when(userService.searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockDoctorPage);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(2)));

        verify(userService).searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    void searchDoctors_withPagination_returnsPagedResults() throws Exception {
        // Arrange
        Page<UserResponseDto> page1 = new PageImpl<>(
                Collections.singletonList(doctor1),
                PageRequest.of(0, 1),
                2
        );
        when(userService.searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(page1);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("page", "0")
                        .param("size", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.number").value(0));
    }

    @Test
    void searchDoctors_returnsCorrectJsonStructure() throws Exception {
        // Arrange
        when(userService.searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockDoctorPage);

        // Act & Assert - Verify all expected fields are present
        mockMvc.perform(get("/api/users/doctors/search")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").exists())
                .andExpect(jsonPath("$.content[0].email").exists())
                .andExpect(jsonPath("$.content[0].fullName").exists())
                .andExpect(jsonPath("$.content[0].role").exists())
                .andExpect(jsonPath("$.content[0].specialization").exists())
                .andExpect(jsonPath("$.content[0].rating").exists())
                .andExpect(jsonPath("$.content[0].consultationFee").exists())
                .andExpect(jsonPath("$.content[0].experienceYears").exists())
                .andExpect(jsonPath("$.content[0].workplace").exists())
                .andExpect(jsonPath("$.pageable").exists())
                .andExpect(jsonPath("$.totalElements").exists())
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.size").exists())
                .andExpect(jsonPath("$.number").exists());
    }

    @Test
    void getSpecializations_returns200WithList() throws Exception {
        // Arrange
        List<String> specializations = Arrays.asList(
                "Cardiology",
                "Dermatology",
                "Pediatrics"
        );
        when(userService.getSpecializations()).thenReturn(specializations);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/specializations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0]").value("Cardiology"))
                .andExpect(jsonPath("$[1]").value("Dermatology"))
                .andExpect(jsonPath("$[2]").value("Pediatrics"));

        verify(userService).getSpecializations();
    }

    @Test
    void getSpecializations_returnsEmptyListWhenNone() throws Exception {
        // Arrange
        when(userService.getSpecializations()).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/specializations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(userService).getSpecializations();
    }

    @Test
    void searchDoctors_withSpecializationFilter_returns200() throws Exception {
        // Arrange
        Page<UserResponseDto> cardiologyPage = new PageImpl<>(
                Collections.singletonList(doctor1)
        );
        when(userService.searchDoctors(
                isNull(),
                eq("Cardiology"),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(cardiologyPage);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("specialization", "Cardiology")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].specialization").value("Cardiology"));
    }

    @Test
    void searchDoctors_withRatingFilter_returns200() throws Exception {
        // Arrange
        when(userService.searchDoctors(
                isNull(),
                isNull(),
                eq(BigDecimal.valueOf(4.5)),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockDoctorPage);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("minRating", "4.5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        verify(userService).searchDoctors(
                isNull(),
                isNull(),
                eq(BigDecimal.valueOf(4.5)),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    void searchDoctors_withMaxFeeFilter_returns200() throws Exception {
        // Arrange
        Page<UserResponseDto> affordableDoctors = new PageImpl<>(
                Collections.singletonList(doctor1)
        );
        when(userService.searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                eq(BigDecimal.valueOf(600000)),
                any(Pageable.class)
        )).thenReturn(affordableDoctors);

        // Act & Assert
        mockMvc.perform(get("/api/users/doctors/search")
                        .param("maxFee", "600000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(userService).searchDoctors(
                isNull(),
                isNull(),
                isNull(),
                eq(BigDecimal.valueOf(600000)),
                any(Pageable.class)
        );
    }
}
