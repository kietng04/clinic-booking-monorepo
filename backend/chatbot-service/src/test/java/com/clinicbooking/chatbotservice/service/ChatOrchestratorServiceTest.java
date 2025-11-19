package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatOrchestratorServiceTest {

    @Mock
    private QuestionClassifierService questionClassifierService;

    @Mock
    private KnowledgeRetrievalService knowledgeRetrievalService;

    @Mock
    private GeminiAnswerService geminiAnswerService;

    private ChatOrchestratorService service;

    @BeforeEach
    void setUp() {
        service = new ChatOrchestratorService(
                questionClassifierService,
                knowledgeRetrievalService,
                geminiAnswerService
        );
    }

    @Test
    void shouldUseGeminiRagWhenAiAnswerAvailable() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "phong kham o dau",
                "phong kham o dau",
                "CLINIC_ADDRESS",
                "Dia chi phong kham",
                0.9,
                "RULE_BASED",
                false,
                "rule"
        );
        RetrievedKnowledge knowledge = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "CLINIC_BRANCH_MAIN",
                        "CLINIC_ADDRESS",
                        "Chi nhanh trung tam",
                        "Chi nhanh o Quan 1",
                        List.of("dia chi")
                ),
                0.81,
                List.of("dia chi")
        );

        when(questionClassifierService.classify("phong kham o dau", "PATIENT")).thenReturn(classification);
        when(knowledgeRetrievalService.retrieve("phong kham o dau", "CLINIC_ADDRESS"))
                .thenReturn(List.of(knowledge));
        when(geminiAnswerService.generateAnswer(any(), any(), any(), any()))
                .thenReturn(Optional.of("Chi nhanh o 120 Nguyen Trai, Quan 1."));

        var response = service.chat("phong kham o dau", "PATIENT");

        assertThat(response.answerProvider()).isEqualTo("GEMINI_RAG");
        assertThat(response.ragUsed()).isTrue();
        assertThat(response.sources()).hasSize(1);
    }

    @Test
    void shouldFallbackToRuleRagWhenAiUnavailable() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "gia kham bao nhieu",
                "gia kham bao nhieu",
                "SERVICE_PRICE",
                "Gia dich vu",
                0.4,
                "RULE_BASED",
                false,
                "rule"
        );
        RetrievedKnowledge knowledge = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "SERVICE_PRICE_BASIC",
                        "SERVICE_PRICE",
                        "Bang gia co ban",
                        "Kham tong quat tu 200000 VND.",
                        List.of("gia")
                ),
                0.63,
                List.of("gia")
        );

        when(questionClassifierService.classify("gia kham bao nhieu", "PATIENT")).thenReturn(classification);
        when(knowledgeRetrievalService.retrieve("gia kham bao nhieu", "SERVICE_PRICE"))
                .thenReturn(List.of(knowledge));
        when(geminiAnswerService.generateAnswer(any(), any(), any(), any()))
                .thenReturn(Optional.empty());

        var response = service.chat("gia kham bao nhieu", "PATIENT");

        assertThat(response.answerProvider()).isEqualTo("RULE_RAG");
        assertThat(response.answer()).contains("du lieu noi bo");
    }
}
