package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.dto.ClinicDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.DoctorDirectoryEntry;
import com.clinicbooking.chatbotservice.dto.MedicalServiceCatalogEntry;
import com.clinicbooking.chatbotservice.model.KnowledgeChunkRow;
import com.clinicbooking.chatbotservice.repository.KnowledgeChunkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LiveKnowledgeSyncServiceTest {

    @Mock
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @Mock
    private EmbeddingService embeddingService;

    @Mock
    private DoctorDirectoryService doctorDirectoryService;

    @Mock
    private ClinicDirectoryService clinicDirectoryService;

    @Mock
    private ServiceCatalogService serviceCatalogService;

    private LiveKnowledgeSyncService service;

    @BeforeEach
    void setUp() {
        service = new LiveKnowledgeSyncService(
                knowledgeChunkRepository,
                embeddingService,
                doctorDirectoryService,
                clinicDirectoryService,
                serviceCatalogService
        );
    }

    @Test
    void shouldSyncClinicsForClinicIntent() {
        ClinicDirectoryEntry clinic = new ClinicDirectoryEntry(1L, "HealthFlow Clinic Q1", "120 Nguyen Trai", "07:30-20:00", true);
        when(clinicDirectoryService.fetchClinicDirectorySnapshot("Bearer token")).thenReturn(List.of(clinic));
        when(embeddingService.embed("HealthFlow Clinic Q1, dia chi 120 Nguyen Trai, gio lam viec 07:30-20:00", EmbeddingTask.RETRIEVAL_DOCUMENT))
                .thenReturn(Optional.of(List.of(1.0, 2.0)));

        service.syncRelevantSources("CLINIC_ADDRESS", "Bearer token");

        ArgumentCaptor<List<KnowledgeChunkRow>> rowsCaptor = ArgumentCaptor.forClass(List.class);
        verify(knowledgeChunkRepository).replaceKnowledgeSource(
                org.mockito.ArgumentMatchers.eq(KnowledgeSourceType.CLINIC_DIRECTORY.name()),
                rowsCaptor.capture(),
                org.mockito.ArgumentMatchers.anyList()
        );
        assertThat(rowsCaptor.getValue()).hasSize(2);
        assertThat(rowsCaptor.getValue()).extracting(KnowledgeChunkRow::knowledgeId)
                .containsExactlyInAnyOrder("CLINIC_ADDRESS_1", "CLINIC_HOURS_1");
    }

    @Test
    void shouldSyncServicesForServiceIntent() {
        MedicalServiceCatalogEntry catalogEntry = new MedicalServiceCatalogEntry(
                10L, 2L, "Kham tong quat", "GENERAL", true, BigDecimal.valueOf(200000)
        );
        when(serviceCatalogService.fetchServiceCatalogSnapshot("Bearer token")).thenReturn(List.of(catalogEntry));
        when(embeddingService.embed("Kham tong quat, nhom GENERAL, gia hien tai 200000 VND, co so 2", EmbeddingTask.RETRIEVAL_DOCUMENT))
                .thenReturn(Optional.of(List.of(1.0, 2.0)));

        service.syncRelevantSources("SERVICE_PRICE", "Bearer token");

        ArgumentCaptor<List<KnowledgeChunkRow>> rowsCaptor = ArgumentCaptor.forClass(List.class);
        verify(knowledgeChunkRepository).replaceKnowledgeSource(
                org.mockito.ArgumentMatchers.eq(KnowledgeSourceType.SERVICE_CATALOG.name()),
                rowsCaptor.capture(),
                org.mockito.ArgumentMatchers.anyList()
        );
        assertThat(rowsCaptor.getValue()).hasSize(2);
    }

    @Test
    void shouldSyncDoctorsForDoctorIntent() {
        DoctorDirectoryEntry doctor = new DoctorDirectoryEntry(
                7L, "Tran Thu Binh", "Tim mach", "HealthFlow Clinic Q1", BigDecimal.valueOf(4.8), BigDecimal.valueOf(300000)
        );
        when(doctorDirectoryService.fetchDoctorDirectorySnapshot("Bearer token")).thenReturn(List.of(doctor));
        when(embeddingService.embed(
                "Bac si Tran Thu Binh chuyen khoa Tim mach, noi lam viec HealthFlow Clinic Q1, danh gia 4.8, phi tu van 300000 VND",
                EmbeddingTask.RETRIEVAL_DOCUMENT
        )).thenReturn(Optional.of(List.of(1.0, 2.0)));

        service.syncRelevantSources("SPECIALTY_CONSULTATION", "Bearer token");

        ArgumentCaptor<List<KnowledgeChunkRow>> rowsCaptor = ArgumentCaptor.forClass(List.class);
        verify(knowledgeChunkRepository).replaceKnowledgeSource(
                org.mockito.ArgumentMatchers.eq(KnowledgeSourceType.DOCTOR_DIRECTORY.name()),
                rowsCaptor.capture(),
                org.mockito.ArgumentMatchers.anyList()
        );
        assertThat(rowsCaptor.getValue()).hasSize(2);
    }
}
