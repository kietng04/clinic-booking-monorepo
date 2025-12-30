package com.clinicbooking.userservice.mapper;

import com.clinicbooking.userservice.dto.familymember.FamilyMemberCreateDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberResponseDto;
import com.clinicbooking.userservice.dto.familymember.FamilyMemberUpdateDto;
import com.clinicbooking.userservice.entity.FamilyMember;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FamilyMemberMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    FamilyMember toEntity(FamilyMemberCreateDto dto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "age", expression = "java(entity.getAge())")
    @Mapping(target = "bmi", expression = "java(entity.getBMI())")
    FamilyMemberResponseDto toDto(FamilyMember entity);

    List<FamilyMemberResponseDto> toDtoList(List<FamilyMember> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(FamilyMemberUpdateDto dto, @MappingTarget FamilyMember entity);
}
