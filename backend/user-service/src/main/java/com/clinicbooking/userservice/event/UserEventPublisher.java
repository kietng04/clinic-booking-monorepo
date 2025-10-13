package com.clinicbooking.userservice.event;

import com.clinicbooking.userservice.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final KafkaTemplate<String, UserEvent> kafkaTemplate;

    @Value("${kafka.topics.user-created}")
    private String userCreatedTopic;

    @Value("${kafka.topics.user-updated}")
    private String userUpdatedTopic;

    @Value("${kafka.topics.user-deleted}")
    private String userDeletedTopic;

    public void publishUserCreated(User user) {
        UserEvent event = buildUserEvent(user, "CREATED");
        kafkaTemplate.send(userCreatedTopic, user.getId().toString(), event);
        log.info("Published user created event: userId={}", user.getId());
    }

    public void publishUserUpdated(User user) {
        UserEvent event = buildUserEvent(user, "UPDATED");
        kafkaTemplate.send(userUpdatedTopic, user.getId().toString(), event);
        log.info("Published user updated event: userId={}", user.getId());
    }

    public void publishUserDeleted(Long userId) {
        UserEvent event = UserEvent.builder()
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .eventType("DELETED")
                .build();
        kafkaTemplate.send(userDeletedTopic, userId.toString(), event);
        log.info("Published user deleted event: userId={}", userId);
    }

    private UserEvent buildUserEvent(User user, String eventType) {
        return UserEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().toString())
                .timestamp(LocalDateTime.now())
                .eventType(eventType)
                .build();
    }
}
