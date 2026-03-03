package com.clinicbooking.chatbotservice.service;

import com.clinicbooking.chatbotservice.model.IntentDefinition;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntentCatalogService {

    private final ObjectMapper objectMapper;

    @Value("classpath:intents/default-intents.json")
    private Resource intentsResource;

    private List<IntentDefinition> intents = Collections.emptyList();

    @PostConstruct
    void loadCatalog() {
        try {
            List<IntentDefinition> loaded = objectMapper.readValue(
                    intentsResource.getInputStream(),
                    new TypeReference<List<IntentDefinition>>() {
                    }
            );

            intents = Collections.unmodifiableList(new ArrayList<>(loaded));
            log.info("Loaded {} intents from catalog", intents.size());
        } catch (IOException ex) {
            throw new IllegalStateException("Cannot load intent catalog", ex);
        }
    }

    public List<IntentDefinition> getIntents() {
        return intents;
    }

    public Optional<IntentDefinition> findById(String intentId) {
        if (intentId == null || intentId.isBlank()) {
            return Optional.empty();
        }

        String normalizedIntentId = intentId.trim().toUpperCase(Locale.ROOT);
        return intents.stream()
                .filter(intent -> normalizedIntentId.equals(intent.id()))
                .findFirst();
    }
}
