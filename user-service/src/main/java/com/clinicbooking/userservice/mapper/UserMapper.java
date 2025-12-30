package com.clinicbooking.userservice.mapper;

import com.clinicbooking.userservice.dto.user.UserResponseDto;
import com.clinicbooking.userservice.entity.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toDto(User user);

    List<UserResponseDto> toDtoList(List<User> users);
}
