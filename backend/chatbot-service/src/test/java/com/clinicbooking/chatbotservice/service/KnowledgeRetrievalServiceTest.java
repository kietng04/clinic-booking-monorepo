package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.KnowledgeDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KnowledgeRetrievalServiceTest {

    @Mock
    private KnowledgeBaseService knowledgeBaseService;

    private KnowledgeRetrievalService service;

    @BeforeEach
    void setUp() {
        service = new KnowledgeRetrievalService(knowledgeBaseService);
        ReflectionTestUtils.setField(service, "topK", 3);
        ReflectionTestUtils.setField(service, "minScore", 0.08);
    }

    @Test
    void shouldRetrieveMatchingDocuments() {
        List<KnowledgeDocument> documents = List.of(
                new KnowledgeDocument(
                        "CLINIC_WORKING_HOURS",
                        "CLINIC_ADDRESS",
                        "Gio lam viec",
                        "Phong kham mo cua tu 7:30 den 20:00.",
                        List.of("gio mo cua", "mo cua may gio")
                ),
                new KnowledgeDocument(
                        "BOOKING_GUIDE",
                        "BOOK_APPOINTMENT",
                        "Dat lich",
                        "Dat lich bang cach chon bac si va khung gio.",
                        List.of("dat lich")
                )
        );

        when(knowledgeBaseService.getDocuments()).thenReturn(documents);

        var results = service.retrieve("phong kham mo cua may gio", "CLINIC_ADDRESS");

        assertThat(results).isNotEmpty();
        assertThat(results.get(0).document().id()).isEqualTo("CLINIC_WORKING_HOURS");
        assertThat(results.get(0).matchedTerms()).contains("mo cua may gio");
    }

    @Test
    void shouldReturnEmptyWhenQuestionBlank() {
        var results = service.retrieve("   ", "UNKNOWN");
        assertThat(results).isEmpty();
    }
}
