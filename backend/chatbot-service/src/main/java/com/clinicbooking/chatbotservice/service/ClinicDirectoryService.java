package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClinicDirectoryEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicDirectoryService {

    private final RestTemplate restTemplate;

    @Value("${services.appointment-service.url:http://localhost:8082}")
    private String appointmentServiceUrl;

    @Value("${chatbot.clinic-directory.max-results:3}")
    private int maxResults;

    public Optional<String> answerClinicDirectory(String authorizationHeader) {
        try {
            List<ClinicDirectoryEntry> clinics = fetchClinics(authorizationHeader).stream()
                    .filter(item -> item != null && item.name() != null && !item.name().isBlank())
                    .filter(item -> item.isActive() == null || item.isActive())
                    .sorted(Comparator.comparing(ClinicDirectoryEntry::id, Comparator.nullsLast(Long::compareTo)))
                    .toList();

            List<ClinicDirectoryEntry> prioritizedClinics = preferRealClinics(clinics).stream()
                    .limit(Math.max(maxResults, 1))
                    .toList();

            if (prioritizedClinics.isEmpty()) {
                return Optional.of("Hien tai toi chua lay duoc danh sach co so dang hoat dong. Ban thu lai sau it phut.");
            }

            String details = prioritizedClinics.stream()
                    .map(this::formatClinic)
                    .reduce((left, right) -> left + "; " + right)
                    .orElse("");

            return Optional.of(
                    "Hien tai HealthFlow co " + clinics.size() + " co so dang hoat dong. "
                            + "Mot so co so tieu bieu: " + details
                            + ". Ban can toi co the loc theo quan hoac chi duong toi mot co so cu the."
            );
        } catch (RestClientException ex) {
            log.warn("Clinic directory lookup failed: {}", ex.getMessage());
            return Optional.of("Toi chua truy cap duoc danh sach co so luc nay. Ban thu lai sau it phut.");
        }
    }

    private List<ClinicDirectoryEntry> fetchClinics(String authorizationHeader) {
        String url = UriComponentsBuilder.fromHttpUrl(appointmentServiceUrl)
                .path("/api/clinics")
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }

        ResponseEntity<List<ClinicDirectoryEntry>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody() == null ? List.of() : response.getBody();
    }

    private List<ClinicDirectoryEntry> preferRealClinics(List<ClinicDirectoryEntry> clinics) {
        List<ClinicDirectoryEntry> healthFlowClinics = clinics.stream()
                .filter(item -> item.name().toLowerCase().contains("healthflow clinic"))
                .toList();

        if (!healthFlowClinics.isEmpty()) {
            return healthFlowClinics;
        }

        List<ClinicDirectoryEntry> nonGeneratedClinics = clinics.stream()
                .filter(item -> {
                    String normalized = item.name().toLowerCase();
                    return !normalized.startsWith("sheet clinic") && !normalized.matches("^c\\d{6,}$");
                })
                .toList();

        return nonGeneratedClinics.isEmpty() ? clinics : nonGeneratedClinics;
    }

    private String formatClinic(ClinicDirectoryEntry clinic) {
        StringBuilder summary = new StringBuilder(clinic.name());

        if (clinic.address() != null && !clinic.address().isBlank()) {
            summary.append(" - ").append(clinic.address());
        }

        if (clinic.openingHours() != null && !clinic.openingHours().isBlank()) {
            summary.append(", gio lam viec ").append(clinic.openingHours());
        }

        return summary.toString();
    }
}
