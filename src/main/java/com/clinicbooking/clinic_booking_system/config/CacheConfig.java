package com.clinicbooking.clinic_booking_system.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis cache configuration
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String USERS_CACHE = "users";
    public static final String DOCTORS_CACHE = "doctors";
    public static final String DOCTOR_SCHEDULES_CACHE = "doctorSchedules";
    public static final String APPOINTMENTS_CACHE = "appointments";
    public static final String SPECIALIZATIONS_CACHE = "specializations";

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
                )
                .disableCachingNullValues();

        // Custom cache configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Users cache - 30 minutes
        cacheConfigurations.put(USERS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Doctors cache - 1 hour (doctor info doesn't change often)
        cacheConfigurations.put(DOCTORS_CACHE, defaultConfig.entryTtl(Duration.ofHours(1)));

        // Doctor schedules - 15 minutes (schedules can change)
        cacheConfigurations.put(DOCTOR_SCHEDULES_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Appointments - 5 minutes (frequently updated)
        cacheConfigurations.put(APPOINTMENTS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Specializations - 24 hours (rarely changes)
        cacheConfigurations.put(SPECIALIZATIONS_CACHE, defaultConfig.entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }
}
