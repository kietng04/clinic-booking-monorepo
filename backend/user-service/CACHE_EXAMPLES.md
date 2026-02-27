# Redis Caching - Code Examples & Usage Guide

## Quick Start Examples

### Example 1: Get User (with Cache)

**First Request (Cache Miss):**
```bash
curl -X GET http://localhost:8081/api/users/123

Response Headers:
X-Response-Time: 245ms (Database query)

Response Body:
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  ...
}

Redis Cache Created:
Key: user-service:users::123
Value: UserResponseDto (JSON)
TTL: 1800 seconds (30 minutes)
```

**Second Request (Cache Hit):**
```bash
curl -X GET http://localhost:8081/api/users/123

Response Headers:
X-Response-Time: 12ms (Redis cache)

Response Body: (Same as above, served from cache)
```

---

### Example 2: Update User (Cache Invalidation)

**Initial State:**
```
Redis Cache contains:
Key: user-service:users::123
Value: Old UserResponseDto
```

**Update Operation:**
```bash
curl -X PUT http://localhost:8081/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "jane@example.com"
  }'

Server Logs:
INFO  - Updating user with ID: 123
INFO  - User cache invalidated for ID: 123, user updated successfully

Redis Cache State (After):
Key: user-service:users::123
Status: DELETED (Cache evicted)
```

**Next Read Operation:**
```bash
curl -X GET http://localhost:8081/api/users/123

Server Logs:
INFO  - Fetching user with ID: 123
DEBUG - User found in database, caching result for ID: 123

Result: Fresh data from database, new cache entry created
```

---

### Example 3: Family Members (List Cache)

**Get Family Members (First Call):**
```bash
curl -X GET http://localhost:8081/api/users/123/family-members

Server Logs:
INFO  - Fetching family members for user ID: 123
DEBUG - Found 2 family members for user ID: 123, caching result

Redis Cache Created:
Key: user-service:familyMembers::123
Value: [FamilyMemberResponseDto1, FamilyMemberResponseDto2]
TTL: 1800 seconds
```

**Get Family Members (Second Call):**
```bash
curl -X GET http://localhost:8081/api/users/123/family-members

Server Logs:
(Cache hit - method not logged)

Result: Served from Redis (12ms response time)
```

**Add Family Member (Cache Invalidation):**
```bash
curl -X POST http://localhost:8081/api/users/123/family-members \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Family Member",
    "relationship": "SPOUSE",
    "dateOfBirth": "1990-01-15"
  }'

Server Logs:
INFO  - Creating family member for user ID: 123
INFO  - Family member created with ID: 789, cache invalidated for user ID: 123

Redis Cache State (After):
Key: user-service:familyMembers::123
Status: DELETED (Cache evicted)
```

**Get Family Members (After Addition):**
```bash
curl -X GET http://localhost:8081/api/users/123/family-members

Result: Fetches from DB, includes new family member, caches result
```

---

## Manual Cache Testing

### Using Redis CLI

**Connect to Redis:**
```bash
redis-cli
127.0.0.1:6379>
```

**View All Cache Keys:**
```bash
KEYS user-service:*
Result:
1) "user-service:users::123"
2) "user-service:familyMembers::456"
3) "user-service:users::789"
```

**View Specific User Cache:**
```bash
GET user-service:users::123
Result:
"{\"id\":123,\"email\":\"user@example.com\",\"fullName\":\"John Doe\",...}"
```

**Check TTL (Time To Live):**
```bash
TTL user-service:users::123
Result: 1234  (seconds remaining)
```

**Manually Expire Cache:**
```bash
DEL user-service:users::123
Result: (integer) 1  (Deleted)

KEYS user-service:users::123
Result: (empty list or set)
```

**View Cache Stats:**
```bash
INFO stats

Result:
# Stats
total_connections_received:10
total_commands_processed:100
instantaneous_ops_per_sec:5
...
```

---

## Monitoring Cache Performance

### Check Cache Hit Rate

**Using Redis Monitoring:**
```bash
# Terminal 1 - Start Redis Monitor
redis-cli MONITOR

# Terminal 2 - Make requests
curl http://localhost:8081/api/users/123
curl http://localhost:8081/api/users/123
curl http://localhost:8081/api/users/456

# Terminal 1 Output:
"GET" "user-service:users::123"     # Cache miss (first time)
"GET" "user-service:users::123"     # Cache hit (served by Redis)
"GET" "user-service:users::456"     # Cache miss (different user)
```

### Application Logs

**Enable Debug Logging:**
```yaml
logging:
  level:
    com.clinicbooking.userservice: DEBUG
    org.springframework.cache: DEBUG
```

**Expected Log Output:**
```
DEBUG - User found in database, caching result for ID: 123
DEBUG - Found 2 family members for user ID: 456, caching result
DEBUG - Cache evicted for user ID: 789
INFO  - User cache invalidated for ID: 123, user updated successfully
```

---

## Testing Scenarios

### Scenario 1: Normal Read-Heavy Workload

```java
// Simulate multiple reads of same user
for (int i = 0; i < 10; i++) {
    UserResponseDto user = userService.getUserById(123L);
    // First iteration: 245ms (DB query)
    // Iterations 2-10: 12ms each (Cache hits)
    // Total time: 245 + (9 * 12) = 353ms
    // Without cache: 10 * 245 = 2450ms
    // Improvement: ~85% faster
}
```

### Scenario 2: Cache Invalidation

```java
// Get user (cache miss)
UserResponseDto user1 = userService.getUserById(123L);  // 245ms

// Get user again (cache hit)
UserResponseDto user2 = userService.getUserById(123L);  // 12ms

// Update user (invalidates cache)
UserUpdateDto updateDto = new UserUpdateDto();
updateDto.setFullName("Updated Name");
userService.updateUser(123L, updateDto);  // Cache evicted

// Get user again (cache miss again)
UserResponseDto user3 = userService.getUserById(123L);  // 245ms
```

### Scenario 3: Concurrent Access

```java
// Multiple threads accessing same user
ExecutorService executor = Executors.newFixedThreadPool(5);
for (int i = 0; i < 100; i++) {
    executor.submit(() -> {
        UserResponseDto user = userService.getUserById(123L);
        // Most requests hit cache concurrently
        // Redis handles concurrent reads efficiently
    });
}
```

### Scenario 4: TTL Expiration

```java
// Get user
UserResponseDto user = userService.getUserById(123L);  // Cached

// Wait 30 minutes (TTL expires)
Thread.sleep(Duration.ofMinutes(30).toMillis());

// Get user again (cache expired)
UserResponseDto user2 = userService.getUserById(123L);  // Cache miss, fetches from DB
```

---

## Troubleshooting Common Issues

### Issue 1: Cache Not Working (Always DB Queries)

**Symptoms:**
```
All requests show 245ms response time (DB query speed)
Redis keys are not created
```

**Debugging Steps:**
```bash
# 1. Check if Redis is running
redis-cli ping
# Expected: PONG

# 2. Check if @EnableCaching is active
# Look for log: "Initializing Redis Cache Manager with TTL: 30 minutes"

# 3. Check cache keys exist
redis-cli KEYS user-service:*
# Should return non-empty list after first query

# 4. Enable debug logging
logging.level.org.springframework.cache=DEBUG

# 5. Verify CacheConfig bean is loaded
# Spring startup logs should show: "Initializing Redis Cache Manager"
```

### Issue 2: Cache Not Being Invalidated

**Symptoms:**
```
After update, old data is returned
redis-cli still shows old cache key
```

**Debugging Steps:**
```bash
# 1. Verify @CacheEvict annotation exists
grep -n "@CacheEvict" UserServiceImpl.java

# 2. Check logs for invalidation message
# Should see: "User cache invalidated for ID: 123"

# 3. Manually clear cache
redis-cli DEL user-service:users::123

# 4. Verify method was actually called
# Add breakpoint or log statement in update method
```

### Issue 3: High Memory Usage

**Symptoms:**
```
Redis memory usage increasing continuously
redis-cli INFO memory shows high used_memory
```

**Causes & Solutions:**
```yaml
# Solution 1: Reduce TTL from 30 to 15 minutes
spring.cache.redis.time-to-live: 900000

# Solution 2: Implement cache size limits
# (Requires custom RedisCacheConfiguration)

# Solution 3: Monitor cache hit rate and adjust accordingly
# If hit rate < 50%, cache isn't effective
```

---

## Code Examples for Developers

### Adding Cache to a New Method

```java
// BEFORE (No caching)
@Override
@Transactional(readOnly = true)
public SomeDto getSomeData(Long id) {
    log.info("Fetching data with ID: {}", id);
    return repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Not found"));
}

// AFTER (With caching)
@Override
@Transactional(readOnly = true)
@Cacheable(value = "somecache", key = "#id", unless = "#result == null")
public SomeDto getSomeData(Long id) {
    log.info("Fetching data with ID: {}", id);
    log.debug("Data found, caching result for ID: {}", id);
    return repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Not found"));
}
```

### Evicting Cache on Update

```java
// BEFORE (No cache invalidation)
@Override
@Transactional
public SomeDto updateSomeData(Long id, UpdateDto dto) {
    SomeEntity entity = findOrThrow(id);
    updateEntity(entity, dto);
    return mapper.toDto(repository.save(entity));
}

// AFTER (With cache eviction)
@Override
@Transactional
@CacheEvict(value = "somecache", key = "#id")
public SomeDto updateSomeData(Long id, UpdateDto dto) {
    SomeEntity entity = findOrThrow(id);
    updateEntity(entity, dto);
    log.info("Cache invalidated for ID: {}, data updated successfully", id);
    return mapper.toDto(repository.save(entity));
}
```

### Using Constants for Cache Names

```java
// BAD - Magic strings (error-prone)
@Cacheable("users")
public UserResponseDto getUserById(Long id) { ... }

// GOOD - Constants (type-safe, DRY)
@Cacheable(CacheConfig.USERS_CACHE)
public UserResponseDto getUserById(Long id) { ... }

// In CacheConfig.java:
public static final String USERS_CACHE = "users";
```

---

## Performance Comparison

### Without Caching
```
Request Pattern: GET /api/users/123 x 100

Database Queries: 100
Total Time: 24.5 seconds (245ms × 100)
Average Response: 245ms
CPU Usage: High
```

### With Caching (30min TTL)
```
Request Pattern: GET /api/users/123 x 100

Database Queries: 1 (first request only)
Redis Hits: 99
Total Time: 1.245 seconds (245ms + 12ms × 99)
Average Response: 12.45ms
CPU Usage: Very Low
Improvement: 95% faster!
```

---

## Best Practices Summary

1. **Always use cache constants** - prevents typos and enables refactoring
2. **Evict on all mutations** - ensures data consistency
3. **Use appropriate unless clauses** - prevent caching null/empty results
4. **Log cache operations** - aids debugging and monitoring
5. **Set reasonable TTL** - balance between freshness and performance
6. **Test cache behavior** - manually verify with redis-cli
7. **Monitor memory usage** - adjust TTL if needed
8. **Plan for Redis unavailability** - graceful degradation is critical

---

## References & Further Reading

- Spring Cache Documentation: https://spring.io/guides/gs/caching/
- Redis Data Types: https://redis.io/docs/data-types/
- Cache Annotations: https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/package-summary.html
- Production Redis Setup: https://redis.io/docs/management/

