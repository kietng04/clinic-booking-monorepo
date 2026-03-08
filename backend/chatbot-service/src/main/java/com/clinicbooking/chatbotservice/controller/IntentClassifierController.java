package com.clinicbooking.chatbotservice.controller;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionRequest;
import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.dto.ChatRequest;
import com.clinicbooking.chatbotservice.dto.ChatResponse;
import com.clinicbooking.chatbotservice.dto.ChatSessionCreateRequest;
import com.clinicbooking.chatbotservice.dto.ChatSessionMessageResponse;
import com.clinicbooking.chatbotservice.dto.ChatSessionResponse;
import com.clinicbooking.chatbotservice.dto.IntentSummaryResponse;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.clinicbooking.chatbotservice.service.ChatOrchestratorService;
import com.clinicbooking.chatbotservice.service.ChatSessionStoreService;
import com.clinicbooking.chatbotservice.service.IntentCatalogService;
import com.clinicbooking.chatbotservice.service.QuestionClassifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chatbot Classifier", description = "Question intent classification endpoints")
public class IntentClassifierController {

    private final QuestionClassifierService questionClassifierService;
    private final ChatOrchestratorService chatOrchestratorService;
    private final IntentCatalogService intentCatalogService;
    private final ChatSessionStoreService chatSessionStoreService;

    @PostMapping("/classify")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    @Operation(summary = "Classify a user question into configured intents")
    public ResponseEntity<ClassifyQuestionResponse> classifyQuestion(
            @Valid @RequestBody ClassifyQuestionRequest request,
            @RequestAttribute(value = "userRole", required = false) String userRole
    ) {
        log.info("Classify question request for role={}", userRole);
        return ResponseEntity.ok(questionClassifierService.classify(request.question(), userRole));
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    @Operation(summary = "Generate chatbot answer with hybrid classify + retrieval + Gemini fallback")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            @RequestAttribute(value = "userRole", required = false) String userRole,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        log.info("Chat request received for role={}", userRole);
        String resolvedSessionId = request.sessionId();
        if ((resolvedSessionId == null || resolvedSessionId.isBlank()) && userId != null) {
            String title = request.message().length() > 60
                    ? request.message().substring(0, 60)
                    : request.message();
            resolvedSessionId = chatSessionStoreService.createSession(userId, userRole, title).id();
        }

        ChatResponse response = chatOrchestratorService.chat(
                request.message(),
                userRole,
                authorizationHeader,
                resolvedSessionId
        );

        if (userId != null && resolvedSessionId != null && !resolvedSessionId.isBlank()) {
            chatSessionStoreService.appendUserMessage(userId, userRole, resolvedSessionId, request.message());
            chatSessionStoreService.appendAssistantMessage(
                    userId,
                    userRole,
                    resolvedSessionId,
                    response.answer(),
                    response.answerProvider(),
                    response.ragUsed(),
                    response.sources()
            );
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/intents")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    @Operation(summary = "Get configured intent catalog")
    public ResponseEntity<List<IntentSummaryResponse>> getIntents() {
        List<IntentSummaryResponse> responses = intentCatalogService.getIntents().stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ChatSessionResponse> createSession(
            @RequestBody(required = false) ChatSessionCreateRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            @RequestAttribute(value = "userRole", required = false) String userRole
    ) {
        String title = request == null ? null : request.title();
        return ResponseEntity.ok(chatSessionStoreService.createSession(userId, userRole, title));
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<ChatSessionResponse>> getSessions(
            @RequestAttribute(value = "userId", required = false) Long userId
    ) {
        return ResponseEntity.ok(chatSessionStoreService.getSessions(userId));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ChatSessionResponse> getSession(
            @PathVariable String sessionId,
            @RequestAttribute(value = "userId", required = false) Long userId
    ) {
        return ResponseEntity.ok(chatSessionStoreService.getSession(userId, sessionId));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<ChatSessionMessageResponse>> getSessionMessages(
            @PathVariable String sessionId,
            @RequestAttribute(value = "userId", required = false) Long userId
    ) {
        return ResponseEntity.ok(chatSessionStoreService.getMessages(userId, sessionId));
    }

    private IntentSummaryResponse toSummary(IntentDefinition intent) {
        return new IntentSummaryResponse(intent.id(), intent.name(), intent.description());
    }
}
