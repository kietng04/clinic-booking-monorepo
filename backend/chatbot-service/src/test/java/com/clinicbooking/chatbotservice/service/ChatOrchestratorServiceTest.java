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

    @Mock
    private DoctorDirectoryService doctorDirectoryService;

    @Mock
    private ClinicDirectoryService clinicDirectoryService;

    @Mock
    private ServiceCatalogService serviceCatalogService;

    private ChatOrchestratorService service;

    @BeforeEach
    void setUp() {
        service = new ChatOrchestratorService(
                questionClassifierService,
                knowledgeRetrievalService,
                geminiAnswerService,
                doctorDirectoryService,
                clinicDirectoryService,
                serviceCatalogService
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

    @Test
    void shouldReturnClinicHoursFromRagWhenAiUnavailable() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "phong kham mo cua may gio",
                "phong kham mo cua may gio",
                "CLINIC_HOURS",
                "Gio mo cua phong kham",
                0.8,
                "RULE_BASED",
                false,
                "rule"
        );
        RetrievedKnowledge knowledge = new RetrievedKnowledge(
                new KnowledgeDocument(
                        "CLINIC_WORKING_HOURS",
                        "CLINIC_HOURS",
                        "Gio lam viec phong kham",
                        "Phong kham lam viec tu 07:30 den 20:00 tu thu hai den thu bay, chu nhat tu 08:00 den 17:00.",
                        List.of("gio mo cua", "mo cua may gio")
                ),
                0.88,
                List.of("mo cua may gio")
        );

        when(questionClassifierService.classify("phong kham mo cua may gio", "PATIENT")).thenReturn(classification);
        when(knowledgeRetrievalService.retrieve("phong kham mo cua may gio", "CLINIC_HOURS"))
                .thenReturn(List.of(knowledge));
        when(geminiAnswerService.generateAnswer(any(), any(), any(), any()))
                .thenReturn(Optional.empty());

        var response = service.chat("phong kham mo cua may gio", "PATIENT");

        assertThat(response.answerProvider()).isEqualTo("RULE_RAG");
        assertThat(response.answer()).contains("07:30 den 20:00");
        assertThat(response.intentId()).isEqualTo("CLINIC_HOURS");
    }

    @Test
    void shouldReturnGreetingWithoutRag() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "hi",
                "hi",
                "GREETING",
                "Chao hoi",
                0.4,
                "RULE_BASED",
                false,
                "rule"
        );

        when(questionClassifierService.classify("hi", "PATIENT")).thenReturn(classification);

        var response = service.chat("hi", "PATIENT");

        assertThat(response.answerProvider()).isEqualTo("RULE_GREETING");
        assertThat(response.ragUsed()).isFalse();
        assertThat(response.answer()).contains("HealthFlow");
    }

    @Test
    void shouldReturnLiveDoctorLookupAnswer() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "co bac si nao ten Binh khong",
                "co bac si nao ten binh khong",
                "DOCTOR_LOOKUP",
                "Tra cuu bac si",
                0.4,
                "RULE_BASED",
                false,
                "rule"
        );

        when(questionClassifierService.classify("co bac si nao ten Binh khong", "PATIENT")).thenReturn(classification);
        when(doctorDirectoryService.answerDoctorLookup(
                "co bac si nao ten Binh khong",
                "co bac si nao ten binh khong",
                "Bearer token"
        )).thenReturn(Optional.of("Toi tim thay 1 bac si phu hop: BS. Tran Thu Binh."));

        var response = service.chat("co bac si nao ten Binh khong", "PATIENT", "Bearer token");

        assertThat(response.answerProvider()).isEqualTo("LIVE_DOCTOR_LOOKUP");
        assertThat(response.ragUsed()).isFalse();
        assertThat(response.answer()).contains("Tran Thu Binh");
    }

    @Test
    void shouldRescueUnknownDoctorNameWithImplicitLookup() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "BS. Tran Thu Binh",
                "bs tran thu binh",
                "UNKNOWN",
                "Khong xac dinh",
                0.0,
                "FALLBACK",
                true,
                "fallback"
        );

        when(questionClassifierService.classify("BS. Tran Thu Binh", "PATIENT")).thenReturn(classification);
        when(doctorDirectoryService.answerImplicitDoctorLookup(
                "BS. Tran Thu Binh",
                "bs tran thu binh",
                "Bearer token"
        )).thenReturn(Optional.of("Toi tim thay 1 bac si phu hop: BS. Tran Thu Binh."));

        var response = service.chat("BS. Tran Thu Binh", "PATIENT", "Bearer token");

        assertThat(response.intentId()).isEqualTo("DOCTOR_LOOKUP");
        assertThat(response.classifierProvider()).isEqualTo("HEURISTIC");
        assertThat(response.answerProvider()).isEqualTo("LIVE_DOCTOR_LOOKUP");
        assertThat(response.answer()).contains("Tran Thu Binh");
    }

    @Test
    void shouldReturnLiveClinicDirectoryAnswer() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "hien gio co cac tru so nao",
                "hien gio co cac tru so nao",
                "CLINIC_DIRECTORY",
                "Danh sach co so",
                0.4,
                "RULE_BASED",
                false,
                "rule"
        );

        when(questionClassifierService.classify("hien gio co cac tru so nao", "PATIENT")).thenReturn(classification);
        when(clinicDirectoryService.answerClinicDirectory("Bearer token"))
                .thenReturn(Optional.of("Hien tai HealthFlow co 3 co so dang hoat dong."));

        var response = service.chat("hien gio co cac tru so nao", "PATIENT", "Bearer token");

        assertThat(response.answerProvider()).isEqualTo("LIVE_CLINIC_DIRECTORY");
        assertThat(response.answer()).contains("3 co so");
    }

    @Test
    void shouldReturnLiveServiceCatalogAnswer() {
        ClassifyQuestionResponse classification = new ClassifyQuestionResponse(
                "ban co dich vu gi",
                "ban co dich vu gi",
                "SERVICE_CATALOG",
                "Danh muc dich vu",
                0.4,
                "RULE_BASED",
                false,
                "rule"
        );

        when(questionClassifierService.classify("ban co dich vu gi", "PATIENT")).thenReturn(classification);
        when(serviceCatalogService.answerServiceCatalog("Bearer token"))
                .thenReturn(Optional.of("Hien tai he thong co 224 dich vu dang mo."));

        var response = service.chat("ban co dich vu gi", "PATIENT", "Bearer token");

        assertThat(response.answerProvider()).isEqualTo("LIVE_SERVICE_CATALOG");
        assertThat(response.answer()).contains("224 dich vu");
    }
}
