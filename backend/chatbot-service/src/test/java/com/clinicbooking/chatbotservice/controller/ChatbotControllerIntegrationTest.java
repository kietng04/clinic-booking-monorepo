package com.clinicbooking.chatbotservice.controller;

import com.clinicbooking.chatbotservice.ChatbotServiceApplication;
import com.clinicbooking.chatbotservice.dto.ChatResponse;
import com.clinicbooking.chatbotservice.dto.ChatSource;
import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.service.ChatOrchestratorService;
import com.clinicbooking.chatbotservice.service.ChatSessionStoreService;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = ChatbotServiceApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {
                "spring.autoconfigure.exclude="
                        + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                        + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
        }
)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatbotControllerIntegrationTest {

    private static final String SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA=";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatOrchestratorService chatOrchestratorService;

    @MockBean
    private ChatSessionStoreService chatSessionStoreService;

    @MockBean
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @Test
    void shouldReturnChatResponseForAuthenticatedRequest() throws Exception {
        when(chatOrchestratorService.chat(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new ChatResponse(
                        "sess-1",
                        "phong kham o dau",
                        "phong kham o dau",
                        "Chi nhanh o 120 Nguyen Trai",
                        "CLINIC_ADDRESS",
                        "Dia chi phong kham",
                        0.9,
                        "RULE_BASED",
                        false,
                        "GEMINI_RAG",
                        true,
                        List.of(new ChatSource("CLINIC_1", "Chi nhanh trung tam", "CLINIC_ADDRESS", 0.91))
                ));

        mockMvc.perform(post("/api/chatbot/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + createToken())
                        .content("""
                                {"message":"phong kham o dau","sessionId":"sess-1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answerProvider").value("GEMINI_RAG"))
                .andExpect(jsonPath("$.ragUsed").value(true))
                .andExpect(jsonPath("$.sources[0].title").value("Chi nhanh trung tam"));
    }

    private String createToken() {
        byte[] secretBytes = java.util.Base64.getDecoder().decode(SECRET.getBytes(StandardCharsets.UTF_8));
        Key key = Keys.hmacShaKeyFor(secretBytes);
        return Jwts.builder()
                .setSubject("patient@example.com")
                .claim("userId", 1L)
                .claim("role", "PATIENT")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
