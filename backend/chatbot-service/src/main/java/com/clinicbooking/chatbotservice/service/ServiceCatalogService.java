package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogEntry;
import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogPageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceCatalogService {

    private final RestTemplate restTemplate;

    @Value("${services.appointment-service.url:http://localhost:8082}")
    private String appointmentServiceUrl;

    @Value("${chatbot.service-catalog.fetch-size:200}")
    private int fetchSize;

    @Value("${chatbot.service-catalog.max-results:5}")
    private int maxResults;

    public Optional<String> answerServiceCatalog(String authorizationHeader) {
        try {
            MedicalServiceCatalogPageResponse page = fetchServices(authorizationHeader);
            List<MedicalServiceCatalogEntry> services = page == null || page.content() == null
                    ? List.of()
                    : page.content().stream()
                    .filter(item -> item != null && item.name() != null && !item.name().isBlank())
                    .filter(item -> item.isActive() == null || item.isActive())
                    .toList();

            if (services.isEmpty()) {
                return Optional.of("Hien tai toi chua lay duoc danh muc dich vu. Ban thu lai sau it phut.");
            }

            List<MedicalServiceCatalogEntry> uniqueServices = deduplicateByName(services).stream()
                    .limit(Math.max(maxResults, 1))
                    .toList();

            String categories = services.stream()
                    .map(MedicalServiceCatalogEntry::category)
                    .filter(category -> category != null && !category.isBlank())
                    .map(this::formatCategory)
                    .distinct()
                    .limit(4)
                    .reduce((left, right) -> left + ", " + right)
                    .orElse("nhieu nhom dich vu");

            String details = uniqueServices.stream()
                    .map(this::formatService)
                    .reduce((left, right) -> left + "; " + right)
                    .orElse("");

            long total = page == null ? services.size() : Math.max(page.totalElements(), services.size());
            return Optional.of(
                    "Hien tai he thong co " + total + " dich vu dang mo. "
                            + "Mot so dich vu tieu bieu: " + details
                            + ". Cac nhom chinh gom " + categories + "."
            );
        } catch (RestClientException ex) {
            log.warn("Service catalog lookup failed: {}", ex.getMessage());
            return Optional.of("Toi chua truy cap duoc danh muc dich vu luc nay. Ban thu lai sau it phut.");
        }
    }

    private MedicalServiceCatalogPageResponse fetchServices(String authorizationHeader) {
        String url = UriComponentsBuilder.fromHttpUrl(appointmentServiceUrl)
                .path("/api/services")
                .queryParam("page", 0)
                .queryParam("size", Math.max(fetchSize, 1))
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }

        ResponseEntity<MedicalServiceCatalogPageResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                MedicalServiceCatalogPageResponse.class
        );

        return response.getBody();
    }

    private List<MedicalServiceCatalogEntry> deduplicateByName(List<MedicalServiceCatalogEntry> services) {
        Map<String, MedicalServiceCatalogEntry> uniqueEntries = new LinkedHashMap<>();
        for (MedicalServiceCatalogEntry service : services) {
            uniqueEntries.putIfAbsent(service.name().trim().toLowerCase(Locale.ROOT), service);
        }
        return List.copyOf(uniqueEntries.values());
    }

    private String formatService(MedicalServiceCatalogEntry service) {
        StringBuilder summary = new StringBuilder(service.name());
        if (service.category() != null && !service.category().isBlank()) {
            summary.append(" (").append(formatCategory(service.category())).append(")");
        }
        return summary.toString();
    }

    private String formatCategory(String category) {
        return category.replace('_', ' ').toLowerCase(Locale.ROOT);
    }
}
