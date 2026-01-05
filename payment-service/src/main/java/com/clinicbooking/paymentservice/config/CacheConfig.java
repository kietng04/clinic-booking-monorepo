package com.clinicbooking.paymentservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    public static final String PAYMENT_ORDERS_CACHE = "paymentOrders";
    public static final String PAYMENT_TRANSACTIONS_CACHE = "paymentTransactions";
    public static final String REFUND_TRANSACTIONS_CACHE = "refundTransactions";
    public static final String PAYMENT_STATUS_CACHE = "paymentStatus";

    public static final int DEFAULT_TTL_MINUTES = 30;
    public static final long TTL_MILLIS = 1800000;

    public static final String CACHE_KEY_PREFIX = "payment-service:";

    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("Initializing Redis Cache Manager");
        log.info("Cache TTL: {} minutes", DEFAULT_TTL_MINUTES);
        log.info("Cache key prefix: {}", CACHE_KEY_PREFIX);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()

                .entryTtl(Duration.ofMinutes(DEFAULT_TTL_MINUTES))

                .disableCachingNullValues()

                .computePrefixWith(name -> CACHE_KEY_PREFIX);

        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .build();

        log.info("Redis Cache Manager initialized successfully");
        log.info("Configured caches: {}, {}, {}, {}",
                PAYMENT_ORDERS_CACHE,
                PAYMENT_TRANSACTIONS_CACHE,
                REFUND_TRANSACTIONS_CACHE,
                PAYMENT_STATUS_CACHE
        );

        return cacheManager;
    }

}
