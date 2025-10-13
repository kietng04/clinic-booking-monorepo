package com.clinicbooking.userservice.dto.familymember;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThatCode;

@DisplayName("FamilyMemberResponseDto Serialization Tests")
class FamilyMemberResponseDtoSerializationTest {

    @Test
    @DisplayName("Family member response DTO should be serializable for Redis cache")
    void familyMemberResponseDtoShouldBeSerializable() {
        FamilyMemberResponseDto dto = FamilyMemberResponseDto.builder()
                .id(1L)
                .userId(2L)
                .fullName("Nguyen Van A")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .gender("MALE")
                .relationship("BROTHER")
                .bloodType("O+")
                .height(new BigDecimal("170.5"))
                .weight(new BigDecimal("65.0"))
                .allergies("None")
                .chronicDiseases("None")
                .avatarUrl("https://example.com/a.png")
                .age(25)
                .bmi(new BigDecimal("22.3"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assertThatCode(() -> {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream out = new ObjectOutputStream(bos);
            out.writeObject(dto);
            out.flush();
        }).doesNotThrowAnyException();
    }
}
