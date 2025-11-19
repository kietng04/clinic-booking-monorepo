package com.clinicbooking.chatbotservice.controller;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionRequest;
import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.dto.ChatRequest;
import com.clinicbooking.chatbotservice.dto.ChatResponse;
import com.clinicbooking.chatbotservice.dto.IntentSummaryResponse;
import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.clinicbooking.chatbotservice.service.ChatOrchestratorService;
import com.clinicbooking.chatbotservice.service.IntentCatalogService;
import com.clinicbooking.chatbotservice.service.QuestionClassifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestAttribute(value = "userRole", required = false) String userRole
    ) {
        log.info("Chat request received for role={}", userRole);
        return ResponseEntity.ok(chatOrchestratorService.chat(request.message(), userRole));
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

    private IntentSummaryResponse toSummary(IntentDefinition intent) {
        return new IntentSummaryResponse(intent.id(), intent.name(), intent.description());
    }
}
