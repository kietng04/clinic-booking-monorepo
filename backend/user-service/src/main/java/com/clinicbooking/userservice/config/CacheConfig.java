package com.clinicbooking.userservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

/**
 * Redis Cache Configuration
 * Provides cache management for User Service with:
 * - 30 minute default TTL (1800000ms)
 * - Null value caching disabled
 * - Key prefix: "user-service:"
 * Cache names:
 * - "users" for user caching
 * - "familyMembers" for family member lists caching
 */
@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    public static final String USERS_CACHE = "users";
    public static final String FAMILY_MEMBERS_CACHE = "familyMembers";
    public static final int DEFAULT_TTL_MINUTES = 30;
    public static final long TTL_MILLIS = 1800000; // 30 minutes in milliseconds

    /**
     * Configure Redis Cache Manager with default configuration
     * TTL is configured via application.yml (spring.cache.redis.time-to-live)
     *
     * @param connectionFactory Redis connection factory
     * @return configured cache manager
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("Initializing Redis Cache Manager with TTL: {} minutes", DEFAULT_TTL_MINUTES);

        // Configure default cache settings
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(DEFAULT_TTL_MINUTES))
                .disableCachingNullValues();

        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .build();

        log.info("Redis Cache Manager initialized successfully with TTL: {} minutes", DEFAULT_TTL_MINUTES);
        return cacheManager;
    }
}
