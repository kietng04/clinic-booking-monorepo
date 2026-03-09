package com.clinicbooking.appointmentservice.event;

import com.clinicbooking.appointmentservice.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final AppointmentService appointmentService;

    @KafkaListener(
            topics = "${kafka.topics.payment-completed}",
            groupId = "${spring.kafka.consumer.group-id}",
            properties = {
                    "spring.json.value.default.type=com.clinicbooking.appointmentservice.event.PaymentCompletedEvent",
                    "spring.json.use.type.headers=false"
            }
    )
    @Transactional
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        try {
            if (event == null || event.getData() == null || event.getData().getAppointmentId() == null) {
                log.warn("Skipping payment.completed event with missing appointment data");
                return;
            }

            appointmentService.markPaymentCompleted(
                    event.getData().getAppointmentId(),
                    event.getData().getOrderId(),
                    event.getData().getPaymentMethod(),
                    event.getData().getCompletedAt()
            );
            log.info(
                    "Marked appointment as paid from payment.completed event: appointmentId={}, orderId={}",
                    event.getData().getAppointmentId(),
                    event.getData().getOrderId()
            );
        } catch (Exception ex) {
            log.error("Failed to process payment.completed event", ex);
            throw new IllegalStateException("Unable to process payment.completed event", ex);
        }
    }
}
