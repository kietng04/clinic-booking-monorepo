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

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatOrchestratorService {

    private final QuestionClassifierService questionClassifierService;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final GeminiAnswerService geminiAnswerService;
    private final DoctorDirectoryService doctorDirectoryService;
    private final ClinicDirectoryService clinicDirectoryService;
    private final ServiceCatalogService serviceCatalogService;

    public ChatResponse chat(String message, String userRole) {
        return chat(message, userRole, null);
    }

    public ChatResponse chat(String message, String userRole, String authorizationHeader) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        ClassifyQuestionResponse classification = questionClassifierService.classify(message, userRole);
        Optional<ChatResponse> specialCaseResponse =
                handleSpecialCase(message, classification, authorizationHeader);
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

        if (aiAnswer.isPresent()) {
            answer = aiAnswer.get();
            answerProvider = ragUsed ? "GEMINI_RAG" : "GEMINI";
        } else {
            answer = buildDeterministicAnswer(classification, retrievedKnowledge);
            answerProvider = ragUsed ? "RULE_RAG" : "RULE_TEMPLATE";
        }

        List<ChatSource> sources = retrievedKnowledge.stream()
                .map(item -> new ChatSource(
                        item.document().id(),
                        item.document().title(),
                        item.document().intentId(),
                        item.score()
                ))
                .toList();

        return buildResponse(
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
            String authorizationHeader
    ) {
        String intentId = classification.intentId() == null
                ? "UNKNOWN"
                : classification.intentId().toUpperCase(Locale.ROOT);

        return switch (intentId) {
            case "GREETING" -> Optional.of(buildResponse(
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
            List<RetrievedKnowledge> retrievedKnowledge
    ) {
        if (!retrievedKnowledge.isEmpty()) {
            String snippet = retrievedKnowledge.get(0).document().content();
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
            String question,
            String normalizedQuestion,
            String answer,
            ClassifyQuestionResponse classification,
            String answerProvider,
            boolean ragUsed,
            List<ChatSource> sources
    ) {
        return new ChatResponse(
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
}
