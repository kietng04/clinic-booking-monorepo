package com.clinicbooking.chatbotservice.service;

import java.util.List;
import java.util.Optional;

public interface EmbeddingService {

    Optional<List<Double>> embed(String text, EmbeddingTask task);
}
