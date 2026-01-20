# Redis Caching Implementation - User Service

## Overview

This document describes the Redis caching implementation for the User Service in the Clinic Booking System. The caching layer improves performance by reducing database queries and providing faster response times for frequently accessed user data.

## Configuration

### Cache Manager Setup

**File:** `src/main/java/com/clinicbooking/userservice/config/CacheConfig.java`

- Enables caching with `@EnableCaching` annotation
- Configures RedisCacheManager with Spring Data Redis
- Default TTL (Time To Live): 30 minutes
- Disables null value caching to prevent stale negative lookups

### Application Configuration

**File:** `src/main/resources/application.yml`

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 1800000      # 30 minutes in milliseconds
      cache-null-values: false   # Don't cache null values
      key-prefix: "user-service:" # Key prefix for all cache entries

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      timeout: 60000ms           # Redis connection timeout
```

## Cache Names

Two cache regions are defined for semantic organization:

| Cache Name | Purpose | Key Pattern |
|-----------|---------|------------|
| `users` | User entity caching | `user-service:users::{userId}` |
| `familyMembers` | Family member lists by user | `user-service:familyMembers::{userId}` |

## Caching Strategy

### User Service (`UserServiceImpl.java`)

#### 1. `getUserById(Long id)`
- **Annotation:** `@Cacheable(value = CacheConfig.USERS_CACHE, key = "#id", unless = "#result == null")`
- **Behavior:**
  - Returns cached user if available
  - Fetches from database and caches if not found
  - Does not cache null results (throws exception)
- **Cache Key:** `user-service:users::{id}`

#### 2. `updateUser(Long id, UserUpdateDto dto)`
- **Annotation:** `@CacheEvict(value = CacheConfig.USERS_CACHE, key = "#id")`
- **Behavior:**
  - Evicts cached user by ID when updated
  - Ensures fresh data is fetched on next read
- **Cache Key:** `user-service:users::{id}`

#### 3. `deleteUser(Long id)`
- **Annotation:** `@CacheEvict(value = CacheConfig.USERS_CACHE, key = "#id")`
- **Behavior:**
  - Evicts cached user by ID when deleted (soft delete)
  - Ensures deleted users are not returned from cache
- **Cache Key:** `user-service:users::{id}`

#### Note on `getAllUsers()` and `getUsersByRole()`
- **Not Cached:** These methods return paginated results which are dynamic
- **Rationale:** Pageable parameters make cache key generation impractical
- **Performance:** Database queries are still optimized with proper indexing

### Family Member Service (`FamilyMemberServiceImpl.java`)

#### 1. `getFamilyMembersByUserId(Long userId)`
- **Annotation:** `@Cacheable(value = CacheConfig.FAMILY_MEMBERS_CACHE, key = "#userId", unless = "#result == null || #result.isEmpty()")`
- **Behavior:**
  - Returns cached family member list if available
  - Fetches from database and caches if not found
  - Does not cache empty lists
- **Cache Key:** `user-service:familyMembers::{userId}`

#### 2. `createFamilyMember(FamilyMemberCreateDto dto)`
- **Annotation:** `@CacheEvict(value = CacheConfig.FAMILY_MEMBERS_CACHE, key = "#dto.userId")`
- **Behavior:**
  - Evicts cached family members list for the user
  - Ensures new family member is included in next fetch
- **Cache Key:** `user-service:familyMembers::{userId}`

#### 3. `updateFamilyMember(Long id, FamilyMemberUpdateDto dto)`
- **Behavior:**
  - Retrieves user ID from family member entity
  - Calls helper method `evictFamilyMembersCache(userId)` to evict cache
  - Ensures updated data is reflected immediately
- **Cache Key:** `user-service:familyMembers::{userId}`

#### 4. `deleteFamilyMember(Long id)`
- **Behavior:**
  - Retrieves user ID from family member entity
  - Calls helper method `evictFamilyMembersCache(userId)` to evict cache
  - Ensures deleted members are not returned from cache
- **Cache Key:** `user-service:familyMembers::{userId}`

#### Helper Method
- **Method:** `evictFamilyMembersCache(Long userId)`
- **Annotation:** `@CacheEvict(value = CacheConfig.FAMILY_MEMBERS_CACHE, key = "#userId")`
- **Purpose:** Centralized cache eviction for family members

## Cache Key Format

Cache keys are prefixed with the service name from `application.yml`:

```
<prefix>:<cacheName>::<key>

Examples:
- user-service:users::123
- user-service:familyMembers::456
```

## Exception Handling & Fallback

### Graceful Degradation

If Redis is unavailable:

1. **Default Behavior:** Spring Cache abstraction logs the error
2. **Fallback:** Requests bypass cache and query database directly
3. **No Impact:** Application continues to function without caching

### Configuration for Production

```yaml
spring:
  redis:
    # Timeout ensures fast failure if Redis is unavailable
    timeout: 60000ms

  cache:
    # Disabling null caching prevents stale data
    redis:
      cache-null-values: false
```

## Performance Impact

### Expected Improvements

- **User Lookups:** 80-90% cache hit rate for repeated user queries
- **Family Member Lists:** 70-85% cache hit rate for user's family members
- **Response Time:** 100-500ms reduction for cached queries
- **Database Load:** 40-60% reduction in SELECT queries for cached data

### Cache Invalidation Strategy

| Operation | Cache Evicted | Reason |
|-----------|--------------|--------|
| Update User | User cache | Ensures fresh data on next read |
| Delete User | User cache | Prevents returning deleted users |
| Create Family Member | Family members list | Includes new member in list |
| Update Family Member | Family members list | Reflects updated member in list |
| Delete Family Member | Family members list | Removes member from cached list |

## Monitoring

### Logging

Cache operations are logged at different levels:

- **INFO:** Cache manager initialization
- **DEBUG:** Cache hits and misses for individual operations

Example log entries:
```
INFO  Initializing Redis Cache Manager with TTL: 30 minutes
DEBUG User found in database, caching result for ID: 123
INFO  User cache invalidated for ID: 123, user updated successfully
```

### Redis CLI Monitoring

View cached data:
```bash
redis-cli
> KEYS user-service:*
> GET user-service:users::123
> TTL user-service:users::123
```

## Best Practices Implemented

1. **Explicit Cache Names:** Using constants for cache names prevents typos
2. **Key Strategy:** Consistent key format with service prefix
3. **Null Handling:** Not caching null values prevents memory waste
4. **TTL Management:** 30-minute TTL balances freshness and performance
5. **Selective Caching:** Only cacheable query methods are cached
6. **Eviction Strategy:** Cache is evicted on mutations to maintain consistency
7. **Transactional Consistency:** Cache annotations work with @Transactional
8. **Error Resilience:** Cache failures don't break application

## Development Notes

### Testing Cache Behavior

To test caching in development:

1. **Enable Redis locally:**
   ```bash
   docker run -d -p 6379:6379 redis:latest
   ```

2. **Observe logs:**
   ```
   mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.clinicbooking=DEBUG"
   ```

3. **Verify cache keys:**
   ```bash
   redis-cli KEYS "user-service:*"
   ```

### Disabling Cache for Testing

```yaml
spring:
  cache:
    type: none  # Disables caching entirely
```

## Future Enhancements

1. **Cache Warming:** Preload frequently accessed users on startup
2. **Cache Metrics:** Expose cache hit/miss ratios via Actuator
3. **Custom TTL:** Different TTLs for different cache types
4. **Distributed Invalidation:** Cache invalidation across service instances
5. **Cache Eviction Policies:** Implement LRU or other eviction strategies

## References

- [Spring Data Redis Documentation](https://spring.io/projects/spring-data-redis)
- [Spring Cache Abstraction](https://spring.io/guides/gs/caching/)
- [Redis Key Design Best Practices](https://redis.io/docs/management/keyspace/)
