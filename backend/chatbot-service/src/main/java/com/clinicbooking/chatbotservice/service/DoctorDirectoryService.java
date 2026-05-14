package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.DoctorDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.DoctorSearchResponse;
import com.clinicbooking.chatbotservice.util.TextNormalizer;
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

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorDirectoryService {

    private record SearchAttempt(String keyword, DoctorSearchResponse response) {
    }

    private static final Set<String> COMMON_VIETNAMESE_SURNAMES = Set.of(
            "nguyen", "tran", "le", "pham", "hoang", "huynh", "phan", "vu", "vo",
            "dang", "bui", "do", "ho", "ngo", "duong", "ly", "truong"
    );
    private static final Pattern CAPITALIZED_WORD = Pattern.compile("\\b\\p{Lu}[\\p{L}'-]*\\b");
    private static final Set<String> GENERIC_LOOKUP_TOKENS = Set.of(
            "bac", "si", "bs", "dr", "nao", "gi", "co", "cac", "nhung", "hien", "gio", "ten",
            "doctor", "named", "tim", "khong", "ko", "o", "dau"
    );

    private static final List<Pattern> NAME_PATTERNS = List.of(
            Pattern.compile("^(?:bs|dr|doctor)\\s+(.+)$"),
            Pattern.compile("^(.+?)\\s+thi\\s+sao$"),
            Pattern.compile(".*\\bco\\s+bac\\s+si\\s+nao\\s+ten\\s+(.+?)(?:\\s+khong|\\s+ko)?$"),
            Pattern.compile(".*\\bbac\\s+si\\s+ten\\s+(.+?)(?:\\s+khong|\\s+ko)?$"),
            Pattern.compile(".*\\btim\\s+bac\\s+si\\s+(.+)$"),
            Pattern.compile(".*\\bdoctor\\s+named\\s+(.+)$"),
            Pattern.compile(".*\\bbac\\s+si\\s+(.+?)(?:\\s+khong|\\s+ko)?$")
    );

    private static final Pattern TRAILING_FILLER = Pattern.compile("\\b(khong|ko|a|ha|nhe|nhi|vay|the|duoc)\\b$");
    private static final NumberFormat RATING_FORMAT = NumberFormat.getNumberInstance(Locale.US);
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getIntegerInstance(Locale.US);

    static {
        RATING_FORMAT.setMinimumFractionDigits(1);
        RATING_FORMAT.setMaximumFractionDigits(2);
        CURRENCY_FORMAT.setGroupingUsed(true);
    }

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${chatbot.doctor-lookup.max-results:3}")
    private int maxResults;

    @Value("${chatbot.doctor-lookup.fetch-size:100}")
    private int snapshotFetchSize;

    public Optional<String> answerDoctorLookup(String question, String normalizedQuestion, String authorizationHeader) {
        String extractedKeyword = extractKeyword(question, normalizedQuestion);
        if (extractedKeyword.isBlank()) {
            return answerDoctorDirectory(authorizationHeader);
        }

        return answerDoctorLookupByKeyword(extractedKeyword, authorizationHeader, true);
    }

    public Optional<String> answerImplicitDoctorLookup(
            String question,
            String normalizedQuestion,
            String authorizationHeader
    ) {
        String extractedKeyword = extractKeyword(question, normalizedQuestion);
        if (extractedKeyword.isBlank()) {
            return Optional.empty();
        }

        return answerDoctorLookupByKeyword(extractedKeyword, authorizationHeader, false);
    }

    public List<DoctorDirectoryEntry> fetchDoctorDirectorySnapshot(String authorizationHeader) {
        try {
            return fetchDoctorsPage(snapshotFetchSize, null, authorizationHeader).stream()
                    .filter(item -> item != null && item.fullName() != null && !item.fullName().isBlank())
                    .toList();
        } catch (RestClientException ex) {
            log.warn("Doctor snapshot fetch failed: {}", ex.getMessage());
            return List.of();
        }
    }

    private Optional<String> answerDoctorLookupByKeyword(
            String extractedKeyword,
            String authorizationHeader,
            boolean respondWhenNoMatch
    ) {
        try {
            SearchAttempt attempt = searchDoctorsWithFallback(extractedKeyword, authorizationHeader);
            DoctorSearchResponse response = attempt.response();
            List<DoctorDirectoryEntry> doctors = toDoctors(response);

            if (doctors.isEmpty()) {
                if (!respondWhenNoMatch) {
                    return Optional.empty();
                }
                return Optional.of(
                        "Hien tai toi khong tim thay bac si nao co ten gan voi \"" + extractedKeyword
                                + "\" trong he thong. Ban thu ten day du hon hoac loc theo chuyen khoa."
                );
            }

            long totalElements = response == null ? doctors.size() : Math.max(response.totalElements(), doctors.size());
            String intro = totalElements > doctors.size()
                    ? "Toi tim thay " + totalElements + " bac si phu hop. Day la " + doctors.size() + " ket qua dau:"
                    : "Toi tim thay " + doctors.size() + " bac si phu hop:";

            String details = doctors.stream()
                    .map(this::formatDoctor)
                    .reduce((left, right) -> left + "; " + right)
                    .orElse("");

            return Optional.of(intro + " " + details + ". Neu ban muon, toi co the loc tiep theo chuyen khoa hoac noi lam viec.");
        } catch (RestClientException ex) {
            log.warn("Doctor lookup failed for keyword '{}': {}", extractedKeyword, ex.getMessage());
            if (!respondWhenNoMatch) {
                return Optional.empty();
            }
            return Optional.of(
                    "Toi chua truy cap duoc danh sach bac si luc nay. Ban thu lai sau it phut hoac vao muc Bac si de tim thu cong."
            );
        }
    }

    String extractKeyword(String question, String normalizedQuestion) {
        String normalized = normalizedQuestion == null || normalizedQuestion.isBlank()
                ? TextNormalizer.normalize(question)
                : normalizedQuestion;

        for (Pattern pattern : NAME_PATTERNS) {
            Matcher matcher = pattern.matcher(normalized);
            if (!matcher.matches()) {
                continue;
            }

            String candidate = cleanupExtractedName(matcher.group(1));
            if (!candidate.isBlank()) {
                return candidate;
            }
        }

        String standaloneCandidate = cleanupExtractedName(question);
        if (looksLikeStandaloneName(question, standaloneCandidate)) {
            return standaloneCandidate;
        }

        return "";
    }

    private DoctorSearchResponse searchDoctors(String keyword, String authorizationHeader) {
        return fetchDoctorSearchResponse(Math.max(maxResults, 1), keyword, authorizationHeader);
    }

    private List<DoctorDirectoryEntry> fetchDoctorsPage(int size, String keyword, String authorizationHeader) {
        DoctorSearchResponse response = fetchDoctorSearchResponse(size, keyword, authorizationHeader);
        return response == null || response.content() == null ? List.of() : response.content();
    }

    private DoctorSearchResponse fetchDoctorSearchResponse(int size, String keyword, String authorizationHeader) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(userServiceUrl)
                .path("/api/users/doctors/search")
                .queryParam("page", 0)
                .queryParam("size", Math.max(size, 1));

        if (keyword != null && !keyword.isBlank()) {
            builder.queryParam("keyword", keyword);
        }

        String url = builder.toUriString();

        HttpHeaders headers = new HttpHeaders();
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }

        ResponseEntity<DoctorSearchResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                DoctorSearchResponse.class
        );

        return response.getBody();
    }

    private SearchAttempt searchDoctorsWithFallback(String keyword, String authorizationHeader) {
        SearchAttempt primaryAttempt = new SearchAttempt(keyword, searchDoctors(keyword, authorizationHeader));
        if (!toDoctors(primaryAttempt.response()).isEmpty()) {
            return primaryAttempt;
        }

        for (String fallbackKeyword : buildFallbackKeywords(keyword)) {
            SearchAttempt fallbackAttempt = new SearchAttempt(fallbackKeyword, searchDoctors(fallbackKeyword, authorizationHeader));
            if (!toDoctors(fallbackAttempt.response()).isEmpty()) {
                return fallbackAttempt;
            }
        }

        return primaryAttempt;
    }

    private List<String> buildFallbackKeywords(String keyword) {
        String normalized = TextNormalizer.normalize(keyword);
        if (normalized.isBlank()) {
            return List.of();
        }

        List<String> tokens = List.of(normalized.split("\\s+"));
        LinkedHashSet<String> fallbacks = new LinkedHashSet<>();

        if (tokens.size() >= 3) {
            fallbacks.add(String.join(" ", tokens.subList(0, 2)));
            fallbacks.add(String.join(" ", tokens.subList(tokens.size() - 2, tokens.size())));
        }

        if (tokens.size() >= 2) {
            fallbacks.add(tokens.get(tokens.size() - 1));
            fallbacks.add(tokens.get(0));
        }

        fallbacks.remove(normalized);
        fallbacks.removeIf(String::isBlank);
        return List.copyOf(fallbacks);
    }

    private List<DoctorDirectoryEntry> toDoctors(DoctorSearchResponse response) {
        return response == null || response.content() == null
                ? List.of()
                : response.content().stream()
                .filter(item -> item != null && item.fullName() != null && !item.fullName().isBlank())
                .limit(Math.max(maxResults, 1))
                .toList();
    }

    private Optional<String> answerDoctorDirectory(String authorizationHeader) {
        try {
            DoctorSearchResponse response = searchDoctors(null, authorizationHeader);
            List<DoctorDirectoryEntry> doctors = toDoctors(response);

            if (doctors.isEmpty()) {
                return Optional.of("Hien tai toi chua lay duoc danh sach bac si. Ban thu lai sau it phut.");
            }

            long totalElements = response == null ? doctors.size() : Math.max(response.totalElements(), doctors.size());
            String details = doctors.stream()
                    .map(this::formatDoctor)
                    .reduce((left, right) -> left + "; " + right)
                    .orElse("");

            return Optional.of(
                    "Hien tai he thong co " + totalElements + " bac si. "
                            + "Mot so bac si tieu bieu: " + details
                            + ". Neu ban muon, toi co the tim theo ten hoac chuyen khoa cu the."
            );
        } catch (RestClientException ex) {
            log.warn("Doctor directory lookup failed: {}", ex.getMessage());
            return Optional.of("Toi chua truy cap duoc danh sach bac si luc nay. Ban thu lai sau it phut.");
        }
    }

    private String cleanupExtractedName(String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return "";
        }

        String cleaned = candidate.trim();
        while (!cleaned.isBlank()) {
            String next = TRAILING_FILLER.matcher(cleaned).replaceFirst("").trim();
            if (next.equals(cleaned)) {
                break;
            }
            cleaned = next;
        }

        cleaned = cleaned.replaceAll("\\s{2,}", " ");

        Set<String> semanticTokens = new LinkedHashSet<>();
        for (String token : TextNormalizer.normalize(cleaned).split("\\s+")) {
            String trimmed = token.trim();
            if (trimmed.length() < 2 || GENERIC_LOOKUP_TOKENS.contains(trimmed)) {
                continue;
            }
            semanticTokens.add(trimmed);
        }

        if (semanticTokens.isEmpty()) {
            return "";
        }

        return cleaned;
    }

    private boolean looksLikeStandaloneName(String question, String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return false;
        }

        String normalizedCandidate = TextNormalizer.normalize(candidate);
        String[] tokens = normalizedCandidate.split("\\s+");
        if (tokens.length < 2 || tokens.length > 4) {
            return false;
        }

        for (String token : tokens) {
            if (token.length() < 2 || GENERIC_LOOKUP_TOKENS.contains(token)) {
                return false;
            }
        }

        if (COMMON_VIETNAMESE_SURNAMES.contains(tokens[0])) {
            return true;
        }

        long capitalizedWords = CAPITALIZED_WORD.matcher(question == null ? "" : question).results().count();
        return capitalizedWords >= 2;
    }

    private String formatDoctor(DoctorDirectoryEntry doctor) {
        StringBuilder summary = new StringBuilder(doctor.fullName());

        if (doctor.specialization() != null && !doctor.specialization().isBlank()) {
            summary.append(" - ").append(doctor.specialization());
        }

        if (doctor.workplace() != null && !doctor.workplace().isBlank()) {
            summary.append(", ").append(doctor.workplace());
        }

        if (doctor.rating() != null) {
            summary.append(", danh gia ").append(formatRating(doctor.rating()));
        }

        if (doctor.consultationFee() != null) {
            summary.append(", phi tu van ").append(formatCurrency(doctor.consultationFee())).append(" VND");
        }

        return summary.toString();
    }

    private String formatRating(BigDecimal rating) {
        synchronized (RATING_FORMAT) {
            return RATING_FORMAT.format(rating);
        }
    }

    private String formatCurrency(BigDecimal amount) {
        synchronized (CURRENCY_FORMAT) {
            return CURRENCY_FORMAT.format(amount);
        }
    }
}
