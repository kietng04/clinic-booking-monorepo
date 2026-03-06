package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.DoctorDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.DoctorSearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoctorDirectoryServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private DoctorDirectoryService service;

    @BeforeEach
    void setUp() {
        service = new DoctorDirectoryService(restTemplate);
        ReflectionTestUtils.setField(service, "userServiceUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(service, "maxResults", 3);
    }

    @Test
    void shouldExtractDoctorNameFromLookupQuestion() {
        String keyword = service.extractKeyword(
                "hien gio co bac si nao ten Binh khong",
                "hien gio co bac si nao ten binh khong"
        );

        assertThat(keyword).isEqualTo("binh");
    }

    @Test
    void shouldTreatGenericDoctorQuestionAsDirectoryLookup() {
        String keyword = service.extractKeyword(
                "hien gio cac bac si nao",
                "hien gio cac bac si nao"
        );

        assertThat(keyword).isBlank();
    }

    @Test
    void shouldExtractDoctorNameFromDoctorTitle() {
        String keyword = service.extractKeyword(
                "BS. Tran Thu Binh",
                "bs tran thu binh"
        );

        assertThat(keyword).isEqualTo("tran thu binh");
    }

    @Test
    void shouldExtractDoctorNameFromStandaloneDoctorName() {
        String keyword = service.extractKeyword(
                "Tran Thu Binh",
                "tran thu binh"
        );

        assertThat(keyword).isEqualTo("Tran Thu Binh");
    }

    @Test
    void shouldExtractDoctorNameFromConversationalSuffix() {
        String keyword = service.extractKeyword(
                "Tran Thu Binh thi sao",
                "tran thu binh thi sao"
        );

        assertThat(keyword).isEqualTo("tran thu binh");
    }

    @Test
    void shouldFormatDoctorLookupFromLiveResponse() {
        DoctorSearchResponse response = new DoctorSearchResponse(
                List.of(new DoctorDirectoryEntry(
                        801L,
                        "BS. Tran Thu Binh",
                        "Tim mach",
                        "Benh vien Cho Ray",
                        new BigDecimal("4.52"),
                        new BigDecimal("798125.67")
                )),
                1
        );

        when(restTemplate.exchange(
                argThat((String url) -> {
                    if (url == null) {
                        return false;
                    }
                    return url.startsWith("http://localhost:8081/api/users/doctors/search?")
                            && url.contains("keyword=binh")
                            && url.contains("page=0")
                            && url.contains("size=3");
                }),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(DoctorSearchResponse.class)
        )).thenReturn(ResponseEntity.ok(response));

        var answer = service.answerDoctorLookup(
                "co bac si nao ten Binh khong",
                "co bac si nao ten binh khong",
                "Bearer token"
        );

        assertThat(answer).isPresent();
        assertThat(answer.get()).contains("BS. Tran Thu Binh");
        assertThat(answer.get()).contains("Tim mach");
        assertThat(answer.get()).contains("798,126 VND");
    }

    @Test
    void shouldSupportImplicitDoctorLookupForStandaloneName() {
        DoctorSearchResponse emptyResponse = new DoctorSearchResponse(List.of(), 0);
        DoctorSearchResponse response = new DoctorSearchResponse(
                List.of(new DoctorDirectoryEntry(
                        801L,
                        "BS. Tran Thu Binh",
                        "Tim mach",
                        "Benh vien Cho Ray",
                        new BigDecimal("4.52"),
                        new BigDecimal("798125.67")
                )),
                1
        );

        when(restTemplate.exchange(
                argThat((String url) -> {
                    if (url == null) {
                        return false;
                    }
                    return url.startsWith("http://localhost:8081/api/users/doctors/search?")
                            && url.contains("keyword=Tran%20Thu%20Binh")
                            && url.contains("page=0")
                            && url.contains("size=3");
                }),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(DoctorSearchResponse.class)
        )).thenReturn(ResponseEntity.ok(emptyResponse));

        when(restTemplate.exchange(
                argThat((String url) -> {
                    if (url == null) {
                        return false;
                    }
                    return url.startsWith("http://localhost:8081/api/users/doctors/search?")
                            && url.contains("keyword=tran%20thu")
                            && url.contains("page=0")
                            && url.contains("size=3");
                }),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(DoctorSearchResponse.class)
        )).thenReturn(ResponseEntity.ok(response));

        var answer = service.answerImplicitDoctorLookup(
                "Tran Thu Binh",
                "tran thu binh",
                "Bearer token"
        );

        assertThat(answer).isPresent();
        assertThat(answer.get()).contains("BS. Tran Thu Binh");
    }

    @Test
    void shouldReturnDoctorDirectoryWhenQuestionIsGeneric() {
        DoctorSearchResponse response = new DoctorSearchResponse(
                List.of(new DoctorDirectoryEntry(
                        101L,
                        "BS. Nguyen Van A",
                        "Noi tong quat",
                        "Phong kham HealthFlow",
                        new BigDecimal("4.80"),
                        new BigDecimal("350000")
                )),
                12
        );

        when(restTemplate.exchange(
                argThat((String url) -> {
                    if (url == null) {
                        return false;
                    }
                    return url.startsWith("http://localhost:8081/api/users/doctors/search?")
                            && !url.contains("keyword=")
                            && url.contains("page=0")
                            && url.contains("size=3");
                }),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(DoctorSearchResponse.class)
        )).thenReturn(ResponseEntity.ok(response));

        var answer = service.answerDoctorLookup(
                "hien gio cac bac si nao",
                "hien gio cac bac si nao",
                "Bearer token"
        );

        assertThat(answer).isPresent();
        assertThat(answer.get()).contains("he thong co 12 bac si");
        assertThat(answer.get()).contains("BS. Nguyen Van A");
    }
}
