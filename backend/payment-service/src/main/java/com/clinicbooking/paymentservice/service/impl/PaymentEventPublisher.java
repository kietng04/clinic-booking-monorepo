package com.clinicbooking.paymentservice.service.impl;

import com.clinicbooking.paymentservice.config.KafkaConfig;
import com.clinicbooking.paymentservice.dto.event.PaymentEvent;
import com.clinicbooking.paymentservice.service.IPaymentEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.kafka.support.SendResult;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentEventPublisher implements IPaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final int SEND_TIMEOUT_SECONDS = 5;

    
    @Override
    public void publishPaymentCreated(PaymentEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("PaymentEvent cannot be null");
        }
        publishEvent(event, KafkaConfig.PAYMENT_CREATED_TOPIC, "payment.created");
    }

    
    @Override
    public void publishPaymentCompleted(PaymentEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("PaymentEvent cannot be null");
        }
        publishEvent(event, KafkaConfig.PAYMENT_COMPLETED_TOPIC, "payment.completed");
    }

    
    @Override
    public void publishPaymentFailed(PaymentEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("PaymentEvent cannot be null");
        }
        publishEvent(event, KafkaConfig.PAYMENT_FAILED_TOPIC, "payment.failed");
    }

    
    @Override
    public void publishPaymentRefunded(PaymentEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("PaymentEvent cannot be null");
        }
        publishEvent(event, KafkaConfig.PAYMENT_REFUNDED_TOPIC, "payment.refunded");
    }

    
    private void publishEvent(PaymentEvent event, String topic, String eventType) {

        if (event == null || event.getData() == null) {
            throw new IllegalArgumentException("Event and event data cannot be null");
        }

        String orderId = event.getData().getOrderId();
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("OrderId cannot be null/empty for event publishing");
        }

        Long appointmentId = event.getData().getAppointmentId();
        log.info("Publishing {} event for order: {}, appointment: {}",
                 eventType, orderId, appointmentId);

        try {

            SendResult<String, Object> result = kafkaTemplate
                    .send(topic, orderId, event)
                    .get(SEND_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            RecordMetadata metadata = result.getRecordMetadata();
            log.info("Successfully published {} event for order: {}. Topic: {}, Partition: {}, Offset: {}",
                     eventType, orderId, metadata.topic(), metadata.partition(), metadata.offset());

        } catch (TimeoutException e) {
            log.error("Timeout publishing {} event for order: {}", eventType, orderId, e);
            throw new RuntimeException("Timeout publishing event after " + SEND_TIMEOUT_SECONDS + "s", e);

        } catch (ExecutionException e) {
            log.error("Failed to publish {} event for order: {}", eventType, orderId, e);
            throw new RuntimeException("Failed to publish event: " + e.getCause().getMessage(), e.getCause());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Interrupted while publishing {} event for order: {}", eventType, orderId, e);
            throw new RuntimeException("Interrupted publishing event", e);
        }
    }

}
