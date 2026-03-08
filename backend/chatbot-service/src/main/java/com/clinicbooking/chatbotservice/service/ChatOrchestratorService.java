package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ChatResponse;
import com.clinicbooking.chatbotservice.dto.ChatSource;
import com.clinicbooking.chatbotservice.dto.ClassifyQuestionResponse;
import com.clinicbooking.chatbotservice.model.RetrievedKnowledge;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatOrchestratorService {
    private static final Set<Character> COMPLETE_SENTENCE_ENDINGS = Set.of('.', '!', '?', '"', '\'');

    private final QuestionClassifierService questionClassifierService;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final GeminiAnswerService geminiAnswerService;
    private final DoctorDirectoryService doctorDirectoryService;
    private final ClinicDirectoryService clinicDirectoryService;
    private final ServiceCatalogService serviceCatalogService;

    public ChatResponse chat(String message, String userRole) {
        return chat(message, userRole, null, null);
    }

    public ChatResponse chat(String message, String userRole, String authorizationHeader) {
        return chat(message, userRole, authorizationHeader, null);
    }

    public ChatResponse chat(String message, String userRole, String authorizationHeader, String sessionId) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        ClassifyQuestionResponse classification = questionClassifierService.classify(message, userRole);
        Optional<ChatResponse> specialCaseResponse =
                handleSpecialCase(message, classification, authorizationHeader, sessionId);
        if (specialCaseResponse.isPresent()) {
            return specialCaseResponse.get();
        }

        List<RetrievedKnowledge> retrievedKnowledge = knowledgeRetrievalService.retrieve(
                classification.normalizedQuestion(),
                classification.intentId()
        );

        Optional<String> aiAnswer;
        try {
            aiAnswer = geminiAnswerService.generateAnswer(message, userRole, classification, retrievedKnowledge);
        } catch (Exception ex) {
            log.warn("Gemini answer generation failed: {}", ex.getMessage());
            aiAnswer = Optional.empty();
        }

        boolean ragUsed = !retrievedKnowledge.isEmpty();
        String answerProvider;
        String answer;

        if (aiAnswer.isPresent() && isUsableAiAnswer(aiAnswer.get())) {
            answer = aiAnswer.get();
            answerProvider = ragUsed ? "GEMINI_RAG" : "GEMINI";
        } else {
            if (aiAnswer.isPresent()) {
                log.warn("Discarding incomplete Gemini answer for intent={}: {}", classification.intentId(), aiAnswer.get());
            }
            answer = buildDeterministicAnswer(classification, retrievedKnowledge, classification.normalizedQuestion());
            answerProvider = ragUsed ? "RULE_RAG" : "RULE_TEMPLATE";
        }

        List<RetrievedKnowledge> orderedKnowledgeForDisplay =
                orderKnowledgeForDisplay(classification.intentId(), classification.normalizedQuestion(), retrievedKnowledge);

        List<ChatSource> sources = orderedKnowledgeForDisplay.stream()
                .map(item -> new ChatSource(
                        item.document().id(),
                        item.document().title(),
                        item.document().intentId(),
                        item.score()
                ))
                .toList();

        return buildResponse(
                sessionId,
                classification.question(),
                classification.normalizedQuestion(),
                answer,
                classification,
                answerProvider,
                ragUsed,
                sources
        );
    }

    private Optional<ChatResponse> handleSpecialCase(
            String message,
            ClassifyQuestionResponse classification,
            String authorizationHeader,
            String sessionId
    ) {
        String intentId = classification.intentId() == null
                ? "UNKNOWN"
                : classification.intentId().toUpperCase(Locale.ROOT);

        return switch (intentId) {
            case "GREETING" -> Optional.of(buildResponse(
                    sessionId,
                    classification.question(),
                    classification.normalizedQuestion(),
                    buildGreetingAnswer(),
                    classification,
                    "RULE_GREETING",
                    false,
                    List.of()
            ));
            case "DOCTOR_LOOKUP" -> doctorDirectoryService
                    .answerDoctorLookup(message, classification.normalizedQuestion(), authorizationHeader)
                    .map(answer -> buildResponse(
                            sessionId,
                            classification.question(),
                            classification.normalizedQuestion(),
                            answer,
                            classification,
                            "LIVE_DOCTOR_LOOKUP",
                            false,
                            List.of()
                    ));
            case "CLINIC_DIRECTORY" -> clinicDirectoryService.answerClinicDirectory(authorizationHeader)
                    .map(answer -> buildResponse(
                            sessionId,
                            classification.question(),
                            classification.normalizedQuestion(),
                            answer,
                            classification,
                            "LIVE_CLINIC_DIRECTORY",
                            false,
                            List.of()
                    ));
            case "SERVICE_CATALOG" -> serviceCatalogService.answerServiceCatalog(authorizationHeader)
                    .map(answer -> buildResponse(
                            sessionId,
                            classification.question(),
                            classification.normalizedQuestion(),
                            answer,
                            classification,
                            "LIVE_SERVICE_CATALOG",
                            false,
                            List.of()
                    ));
            case "UNKNOWN" -> doctorDirectoryService
                    .answerImplicitDoctorLookup(message, classification.normalizedQuestion(), authorizationHeader)
                    .map(answer -> buildResponse(
                            sessionId,
                            classification.question(),
                            classification.normalizedQuestion(),
                            answer,
                            asDoctorLookupClassification(classification),
                            "LIVE_DOCTOR_LOOKUP",
                            false,
                            List.of()
                    ));
            default -> Optional.empty();
        };
    }

    private String buildDeterministicAnswer(
            ClassifyQuestionResponse classification,
            List<RetrievedKnowledge> retrievedKnowledge,
            String normalizedQuestion
    ) {
        if (!retrievedKnowledge.isEmpty()) {
            String snippet = selectDeterministicSnippet(classification.intentId(), normalizedQuestion, retrievedKnowledge);
            return "Theo du lieu noi bo, " + snippet
                    + " Neu ban muon, toi co the huong dan tiep theo theo vai tro cua ban.";
        }

        String intentId = classification.intentId() == null
                ? "UNKNOWN"
                : classification.intentId().toUpperCase(Locale.ROOT);

        return switch (intentId) {
            case "GREETING" ->
                    "Xin chao. Toi la tro ly AI cua HealthFlow. Ban co the hoi toi ve dat lich, dia chi phong kham, gia dich vu, hoac tim bac si.";
            case "BOOK_APPOINTMENT" ->
                    "Ban co the vao muc Dat lich kham, chon bac si, khung gio phu hop va xac nhan lich hen.";
            case "RESCHEDULE_APPOINTMENT" ->
                    "Ban mo chi tiet lich hen va chon Doi lich. He thong se hien thi cac khung gio con trong.";
            case "CANCEL_APPOINTMENT" ->
                    "Ban vao chi tiet lich hen va chon Huy lich. Neu can, ban co the dat lai ngay sau do.";
            case "SERVICE_PRICE" ->
                    "Ban co the xem gia dich vu trong muc dat lich hoac hoi ro ten dich vu de toi tra loi chinh xac hon.";
            case "SERVICE_CATALOG" ->
                    "HealthFlow co nhieu dich vu kham tong quat, chuyen khoa va can lam sang. Ban co the hoi ten dich vu cu the de toi tra loi chi tiet hon.";
            case "CLINIC_DIRECTORY" ->
                    "HealthFlow co nhieu chi nhanh dang hoat dong. Neu can, toi co the liet ke cac co so dang mo va dia chi tung noi.";
            case "CLINIC_ADDRESS" ->
                    "Ban co the xem thong tin chi nhanh trong muc phong kham. Neu can, toi co the chi duong chi tiet.";
            default ->
                    "Toi chua du thong tin de tra loi chinh xac. Ban co the noi ro hon nhu ten dich vu, bac si, hoac thoi gian mong muon.";
        };
    }

    private String selectDeterministicSnippet(
            String intentId,
            String normalizedQuestion,
            List<RetrievedKnowledge> retrievedKnowledge
    ) {
        String safeIntentId = intentId == null ? "UNKNOWN" : intentId.toUpperCase(Locale.ROOT);
        if (!"CLINIC_ADDRESS".equals(safeIntentId)) {
            return retrievedKnowledge.get(0).document().content();
        }

        boolean asksForWorkingHours = containsAny(normalizedQuestion,
                "gio mo cua",
                "mo cua may gio",
                "gio lam viec",
                "lam viec tu may gio",
                "tu may gio den may gio",
                "dong cua may gio",
                "mo cua luc nao");
        boolean asksForAddress = containsAny(normalizedQuestion,
                "dia chi",
                "o dau",
                "chi nhanh",
                "tru so",
                "co so",
                "ban do");

        if (asksForWorkingHours) {
            Optional<RetrievedKnowledge> workingHoursDoc = retrievedKnowledge.stream()
                    .filter(item -> containsAny(item.document().title().toLowerCase(Locale.ROOT), "gio lam viec", "mo cua"))
                    .findFirst();
            if (workingHoursDoc.isPresent()) {
                return workingHoursDoc.get().document().content();
            }
        }

        if (asksForAddress) {
            Optional<RetrievedKnowledge> addressDoc = retrievedKnowledge.stream()
                    .filter(item -> containsAny(item.document().title().toLowerCase(Locale.ROOT), "chi nhanh", "dia chi")
                            || containsAny(item.document().content().toLowerCase(Locale.ROOT), "nguyen trai", "tp hcm", "tong dai"))
                    .findFirst();
            if (addressDoc.isPresent()) {
                return addressDoc.get().document().content();
            }
        }

        return retrievedKnowledge.get(0).document().content();
    }

    private List<RetrievedKnowledge> orderKnowledgeForDisplay(
            String intentId,
            String normalizedQuestion,
            List<RetrievedKnowledge> retrievedKnowledge
    ) {
        if (retrievedKnowledge == null || retrievedKnowledge.isEmpty()) {
            return List.of();
        }

        String prioritizedSnippet = selectDeterministicSnippet(intentId, normalizedQuestion, retrievedKnowledge);
        Optional<RetrievedKnowledge> prioritizedDocument = retrievedKnowledge.stream()
                .filter(item -> prioritizedSnippet.equals(item.document().content()))
                .findFirst();

        if (prioritizedDocument.isEmpty()) {
            return retrievedKnowledge;
        }

        List<RetrievedKnowledge> ordered = new java.util.ArrayList<>();
        ordered.add(prioritizedDocument.get());
        retrievedKnowledge.stream()
                .filter(item -> item != prioritizedDocument.get())
                .forEach(ordered::add);
        return List.copyOf(ordered);
    }

    private boolean containsAny(String text, String... candidates) {
        if (text == null || text.isBlank()) {
            return false;
        }

        String normalizedText = text.toLowerCase(Locale.ROOT);
        for (String candidate : candidates) {
            if (normalizedText.contains(candidate.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private String buildGreetingAnswer() {
        return "Xin chao. Toi la tro ly AI cua HealthFlow. Ban co the hoi toi ve dat lich, tim bac si, dia chi phong kham, hoac gia dich vu.";
    }

    private ClassifyQuestionResponse asDoctorLookupClassification(ClassifyQuestionResponse classification) {
        return new ClassifyQuestionResponse(
                classification.question(),
                classification.normalizedQuestion(),
                "DOCTOR_LOOKUP",
                "Tra cuu bac si",
                Math.max(classification.confidence(), 0.36d),
                "HEURISTIC",
                true,
                "Implicit doctor lookup matched a live directory result"
        );
    }

    private ChatResponse buildResponse(
            String sessionId,
            String question,
            String normalizedQuestion,
            String answer,
            ClassifyQuestionResponse classification,
            String answerProvider,
            boolean ragUsed,
            List<ChatSource> sources
    ) {
        return new ChatResponse(
                sessionId,
                question,
                normalizedQuestion,
                answer,
                classification.intentId(),
                classification.intentName(),
                classification.confidence(),
                classification.provider(),
                classification.fallbackUsed(),
                answerProvider,
                ragUsed,
                sources
        );
    }

    private boolean isUsableAiAnswer(String answer) {
        if (answer == null) {
            return false;
        }

        String trimmed = answer.trim();
        if (trimmed.isBlank()) {
            return false;
        }

        char lastCharacter = trimmed.charAt(trimmed.length() - 1);
        return COMPLETE_SENTENCE_ENDINGS.contains(lastCharacter);
    }
}
