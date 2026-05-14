package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClinicDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.DoctorDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogEntry;
import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveKnowledgeSyncService {

    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final EmbeddingService embeddingService;
    private final DoctorDirectoryService doctorDirectoryService;
    private final ClinicDirectoryService clinicDirectoryService;
    private final ServiceCatalogService serviceCatalogService;

    public void syncRelevantSources(String intentId, String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return;
        }

        String normalizedIntent = intentId == null ? "UNKNOWN" : intentId.trim().toUpperCase(Locale.ROOT);
        switch (normalizedIntent) {
            case "CLINIC_ADDRESS", "CLINIC_HOURS" -> syncClinics(authorizationHeader);
            case "SERVICE_PRICE", "SERVICE_CATALOG" -> syncServices(authorizationHeader);
            case "CHECK_DOCTOR_SCHEDULE", "SPECIALTY_CONSULTATION" -> syncDoctors(authorizationHeader);
            default -> {
            }
        }
    }

    void syncDoctors(String authorizationHeader) {
        List<DoctorDirectoryEntry> doctors = doctorDirectoryService.fetchDoctorDirectorySnapshot(authorizationHeader);
        List<KnowledgeChunkRow> rows = new ArrayList<>();
        List<float[]> embeddings = new ArrayList<>();

        for (DoctorDirectoryEntry doctor : doctors) {
            if (doctor == null || doctor.id() == null || doctor.fullName() == null || doctor.fullName().isBlank()) {
                continue;
            }

            String content = buildDoctorContent(doctor);
            embeddingService.embed(content, EmbeddingTask.RETRIEVAL_DOCUMENT)
                    .map(this::toFloatArray)
                    .ifPresent(embedding -> {
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "DOCTOR_SPECIALTY_" + doctor.id(),
                                "SPECIALTY_CONSULTATION",
                                doctor.fullName(),
                                content,
                                List.of("bac si", doctor.fullName(), doctor.specialization() == null ? "" : doctor.specialization()),
                                KnowledgeSourceType.DOCTOR_DIRECTORY.name()
                        ));
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "DOCTOR_SCHEDULE_" + doctor.id(),
                                "CHECK_DOCTOR_SCHEDULE",
                                doctor.fullName(),
                                content,
                                List.of("lich bac si", doctor.fullName()),
                                KnowledgeSourceType.DOCTOR_DIRECTORY.name()
                        ));
                    });
        }

        if (!rows.isEmpty()) {
            knowledgeChunkRepository.replaceKnowledgeSource(KnowledgeSourceType.DOCTOR_DIRECTORY.name(), rows, embeddings);
            log.info("Synced {} doctor knowledge chunks", rows.size());
        }
    }

    void syncClinics(String authorizationHeader) {
        List<ClinicDirectoryEntry> clinics = clinicDirectoryService.fetchClinicDirectorySnapshot(authorizationHeader);
        List<KnowledgeChunkRow> rows = new ArrayList<>();
        List<float[]> embeddings = new ArrayList<>();

        for (ClinicDirectoryEntry clinic : clinics) {
            if (clinic == null || clinic.id() == null || clinic.name() == null || clinic.name().isBlank()) {
                continue;
            }

            String content = buildClinicContent(clinic);
            embeddingService.embed(content, EmbeddingTask.RETRIEVAL_DOCUMENT)
                    .map(this::toFloatArray)
                    .ifPresent(embedding -> {
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "CLINIC_ADDRESS_" + clinic.id(),
                                "CLINIC_ADDRESS",
                                clinic.name(),
                                content,
                                List.of("phong kham", "chi nhanh", clinic.name(), clinic.address() == null ? "" : clinic.address()),
                                KnowledgeSourceType.CLINIC_DIRECTORY.name()
                        ));
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "CLINIC_HOURS_" + clinic.id(),
                                "CLINIC_HOURS",
                                clinic.name(),
                                content,
                                List.of("gio mo cua", "gio lam viec", clinic.name()),
                                KnowledgeSourceType.CLINIC_DIRECTORY.name()
                        ));
                    });
        }

        if (!rows.isEmpty()) {
            knowledgeChunkRepository.replaceKnowledgeSource(KnowledgeSourceType.CLINIC_DIRECTORY.name(), rows, embeddings);
            log.info("Synced {} clinic knowledge chunks", rows.size());
        }
    }

    void syncServices(String authorizationHeader) {
        List<MedicalServiceCatalogEntry> services = serviceCatalogService.fetchServiceCatalogSnapshot(authorizationHeader);
        List<KnowledgeChunkRow> rows = new ArrayList<>();
        List<float[]> embeddings = new ArrayList<>();

        for (MedicalServiceCatalogEntry service : services) {
            if (service == null || service.id() == null || service.name() == null || service.name().isBlank()) {
                continue;
            }

            String content = buildServiceContent(service);
            embeddingService.embed(content, EmbeddingTask.RETRIEVAL_DOCUMENT)
                    .map(this::toFloatArray)
                    .ifPresent(embedding -> {
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "SERVICE_PRICE_" + service.id(),
                                "SERVICE_PRICE",
                                service.name(),
                                content,
                                List.of("gia dich vu", service.name(), service.category() == null ? "" : service.category()),
                                KnowledgeSourceType.SERVICE_CATALOG.name()
                        ));
                        addChunk(rows, embeddings, embedding, new KnowledgeChunkRow(
                                "SERVICE_CATALOG_" + service.id(),
                                "SERVICE_CATALOG",
                                service.name(),
                                content,
                                List.of("dich vu", service.name(), service.category() == null ? "" : service.category()),
                                KnowledgeSourceType.SERVICE_CATALOG.name()
                        ));
                    });
        }

        if (!rows.isEmpty()) {
            knowledgeChunkRepository.replaceKnowledgeSource(KnowledgeSourceType.SERVICE_CATALOG.name(), rows, embeddings);
            log.info("Synced {} service knowledge chunks", rows.size());
        }
    }

    private String buildDoctorContent(DoctorDirectoryEntry doctor) {
        return "Bac si " + doctor.fullName()
                + (doctor.specialization() == null || doctor.specialization().isBlank() ? "" : " chuyen khoa " + doctor.specialization())
                + (doctor.workplace() == null || doctor.workplace().isBlank() ? "" : ", noi lam viec " + doctor.workplace())
                + (doctor.rating() == null ? "" : ", danh gia " + doctor.rating())
                + (doctor.consultationFee() == null ? "" : ", phi tu van " + doctor.consultationFee() + " VND");
    }

    private String buildClinicContent(ClinicDirectoryEntry clinic) {
        return clinic.name()
                + (clinic.address() == null || clinic.address().isBlank() ? "" : ", dia chi " + clinic.address())
                + (clinic.openingHours() == null || clinic.openingHours().isBlank() ? "" : ", gio lam viec " + clinic.openingHours());
    }

    private String buildServiceContent(MedicalServiceCatalogEntry service) {
        return service.name()
                + (service.category() == null || service.category().isBlank() ? "" : ", nhom " + service.category())
                + (service.currentPrice() == null ? "" : ", gia hien tai " + service.currentPrice() + " VND")
                + (service.clinicId() == null ? "" : ", co so " + service.clinicId());
    }

    private float[] toFloatArray(List<Double> values) {
        float[] result = new float[values.size()];
        for (int index = 0; index < values.size(); index++) {
            result[index] = values.get(index).floatValue();
        }
        return result;
    }

    private void addChunk(
            List<KnowledgeChunkRow> rows,
            List<float[]> embeddings,
            float[] embedding,
            KnowledgeChunkRow row
    ) {
        rows.add(row);
        embeddings.add(embedding);
    }
}
