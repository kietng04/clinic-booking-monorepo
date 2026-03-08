package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ChatSessionMessageResponse;
import com.clinicbooking.chatbotservice.dto.ChatSessionResponse;
import com.clinicbooking.chatbotservice.dto.ChatSource;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatSessionStoreService {

    private static final String SESSION_PREFIX = "chatbot:session:";
    private static final String SESSION_MESSAGES_SUFFIX = ":messages";
    private static final String USER_SESSIONS_PREFIX = "chatbot:user:";
    private static final String USER_SESSIONS_SUFFIX = ":sessions";
    private static final String ISO_KEY_CREATED_AT = "createdAt";
    private static final String ISO_KEY_UPDATED_AT = "updatedAt";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public ChatSessionResponse createSession(Long userId, String userRole, String title) {
        String sessionId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        String normalizedTitle = title == null || title.isBlank() ? "Cuoc tro chuyen moi" : title.trim();

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("id", sessionId);
        payload.put("userId", String.valueOf(userId));
        payload.put("userRole", safe(userRole));
        payload.put("title", normalizedTitle);
        payload.put("lastMessagePreview", "");
        payload.put("messageCount", "0");
        payload.put(ISO_KEY_CREATED_AT, now.toString());
        payload.put(ISO_KEY_UPDATED_AT, now.toString());

        redisTemplate.opsForHash().putAll(sessionKey(sessionId), payload);
        redisTemplate.opsForZSet().add(userSessionsKey(userId), sessionId, toScore(now));

        return toSessionResponse(payload);
    }

    public List<ChatSessionResponse> getSessions(Long userId) {
        List<String> sessionIds = redisTemplate.opsForZSet()
                .reverseRange(userSessionsKey(userId), 0, -1)
                .stream()
                .toList();

        List<ChatSessionResponse> sessions = new ArrayList<>();
        for (String sessionId : sessionIds) {
            Map<Object, Object> stored = redisTemplate.opsForHash().entries(sessionKey(sessionId));
            if (!stored.isEmpty()) {
                sessions.add(toSessionResponse(stored));
            }
        }
        return sessions;
    }

    public ChatSessionResponse getSession(Long userId, String sessionId) {
        Map<Object, Object> stored = redisTemplate.opsForHash().entries(sessionKey(sessionId));
        if (stored.isEmpty()) {
            throw new IllegalArgumentException("Chat session not found");
        }

        Long ownerId = Long.valueOf(String.valueOf(stored.get("userId")));
        if (!Objects.equals(ownerId, userId)) {
            throw new IllegalArgumentException("Chat session does not belong to the current user");
        }

        return toSessionResponse(stored);
    }

    public List<ChatSessionMessageResponse> getMessages(Long userId, String sessionId) {
        getSession(userId, sessionId);
        List<String> entries = redisTemplate.opsForList().range(sessionMessagesKey(sessionId), 0, -1);
        List<ChatSessionMessageResponse> messages = new ArrayList<>();
        for (String entry : entries) {
            messages.add(deserializeMessage(entry));
        }
        return messages;
    }

    public void appendUserMessage(Long userId, String userRole, String sessionId, String text) {
        appendMessage(userId, userRole, sessionId, "user", text, null, false, List.of());
    }

    public void appendAssistantMessage(
            Long userId,
            String userRole,
            String sessionId,
            String text,
            String answerProvider,
            boolean ragUsed,
            List<ChatSource> sources
    ) {
        appendMessage(userId, userRole, sessionId, "assistant", text, answerProvider, ragUsed, sources);
    }

    private void appendMessage(
            Long userId,
            String userRole,
            String sessionId,
            String role,
            String text,
            String answerProvider,
            boolean ragUsed,
            List<ChatSource> sources
    ) {
        ChatSessionResponse session = getSession(userId, sessionId);
        LocalDateTime now = LocalDateTime.now();
        ChatSessionMessageResponse message = new ChatSessionMessageResponse(
                UUID.randomUUID().toString(),
                sessionId,
                role,
                text,
                answerProvider,
                ragUsed,
                now,
                sources == null ? List.of() : sources
        );

        redisTemplate.opsForList().rightPush(sessionMessagesKey(sessionId), serializeMessage(message));

        Map<String, String> updates = new LinkedHashMap<>();
        updates.put("userRole", safe(userRole));
        updates.put("lastMessagePreview", buildPreview(text));
        updates.put("messageCount", String.valueOf(session.messageCount() + 1));
        updates.put(ISO_KEY_UPDATED_AT, now.toString());
        redisTemplate.opsForHash().putAll(sessionKey(sessionId), updates);
        redisTemplate.opsForZSet().add(userSessionsKey(userId), sessionId, toScore(now));
    }

    private ChatSessionResponse toSessionResponse(Map<?, ?> stored) {
        return new ChatSessionResponse(
                readString(stored, "id", ""),
                Long.valueOf(readString(stored, "userId", "0")),
                readString(stored, "userRole", ""),
                readString(stored, "title", "Cuoc tro chuyen moi"),
                readString(stored, "lastMessagePreview", ""),
                Long.parseLong(readString(stored, "messageCount", "0")),
                LocalDateTime.parse(readString(stored, ISO_KEY_CREATED_AT, LocalDateTime.now().toString())),
                LocalDateTime.parse(readString(stored, ISO_KEY_UPDATED_AT, LocalDateTime.now().toString()))
        );
    }

    private ChatSessionMessageResponse deserializeMessage(String value) {
        try {
            return objectMapper.readValue(value, ChatSessionMessageResponse.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to deserialize chat session message", ex);
        }
    }

    private String serializeMessage(ChatSessionMessageResponse value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize chat session message", ex);
        }
    }

    private double toScore(LocalDateTime value) {
        return value.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    private String sessionKey(String sessionId) {
        return SESSION_PREFIX + sessionId;
    }

    private String sessionMessagesKey(String sessionId) {
        return SESSION_PREFIX + sessionId + SESSION_MESSAGES_SUFFIX;
    }

    private String userSessionsKey(Long userId) {
        return USER_SESSIONS_PREFIX + userId + USER_SESSIONS_SUFFIX;
    }

    private String buildPreview(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String trimmed = text.trim();
        return trimmed.length() <= 80 ? trimmed : trimmed.substring(0, 80) + "...";
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String readString(Map<?, ?> stored, String key, String fallback) {
        Object value = stored.get(key);
        return value == null ? fallback : String.valueOf(value);
    }
}
