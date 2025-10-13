package com.clinicbooking.paymentservice.service;

import com.clinicbooking.paymentservice.dto.event.PaymentEvent;

public interface IPaymentEventPublisher {

    
    void publishPaymentCreated(PaymentEvent event);

    
    void publishPaymentCompleted(PaymentEvent event);

    
    void publishPaymentFailed(PaymentEvent event);

    
    void publishPaymentRefunded(PaymentEvent event);

}
