package com.clinicbooking.paymentservice.util;

import lombok.extern.slf4j.Slf4j;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
public final class OrderIdGenerator {

    private static final String ORDER_PREFIX = "ORDER";
    private static final int RANDOM_SUFFIX_LENGTH = 6;
    private static final int MAX_RANDOM_VALUE = 999999;

    private static final AtomicLong lastTimestamp = new AtomicLong(0);
    private static final AtomicLong sequence = new AtomicLong(0);

    private static final Random random = new Random();

    
    private OrderIdGenerator() {
        throw new AssertionError("Cannot instantiate utility class");
    }

    
    public static synchronized String generateOrderId() {

        long currentTimestamp = System.currentTimeMillis();

        long lastTs = lastTimestamp.get();

        if (currentTimestamp == lastTs) {
            sequence.incrementAndGet();
        } else {

            lastTimestamp.set(currentTimestamp);
            sequence.set(0);
        }

        int randomSuffix = random.nextInt(MAX_RANDOM_VALUE + 1);

        long sequenceValue = sequence.get();
        int finalRandomSuffix = (int) ((randomSuffix + sequenceValue) % (MAX_RANDOM_VALUE + 1));

        String orderId = String.format(
            "%s%d%06d",
            ORDER_PREFIX,
            currentTimestamp,
            finalRandomSuffix
        );

        log.debug("Generated new order ID: {}", orderId);
        return orderId;
    }

    
    public static boolean isValidOrderId(String orderId) {
        if (orderId == null || orderId.isEmpty()) {
            return false;
        }

        if (!orderId.startsWith(ORDER_PREFIX)) {
            return false;
        }

        String withoutPrefix = orderId.substring(ORDER_PREFIX.length());

        if (withoutPrefix.length() < 19) {
            return false;
        }

        try {
            Long.parseLong(withoutPrefix.substring(0, 13));
            Integer.parseInt(withoutPrefix.substring(13, 19));
            return true;
        } catch (NumberFormatException e) {
            log.debug("Invalid order ID format: {}", orderId);
            return false;
        }
    }

    
    public static long extractTimestamp(String orderId) {
        if (!isValidOrderId(orderId)) {
            return -1;
        }

        try {
            String timestampStr = orderId.substring(ORDER_PREFIX.length(), ORDER_PREFIX.length() + 13);
            return Long.parseLong(timestampStr);
        } catch (Exception e) {
            log.debug("Failed to extract timestamp from order ID: {}", orderId);
            return -1;
        }
    }
}
