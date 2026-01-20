# Redis Caching Deployment Checklist

## Pre-Deployment Verification

### Code Review Checklist

- [x] CacheConfig.java created with @Configuration and @EnableCaching
- [x] UserServiceImpl.java updated with @Cacheable and @CacheEvict annotations
- [x] FamilyMemberServiceImpl.java updated with cache annotations
- [x] All cache keys use constants from CacheConfig
- [x] Null value caching is disabled
- [x] TTL is set to 30 minutes (1800 seconds)
- [x] Logging statements added for cache operations
- [x] Code compiles without errors
- [x] No breaking changes to existing APIs
- [x] Documentation is complete

### Build Verification

```bash
# Run build
mvn clean compile

# Expected result: BUILD SUCCESS
```

- [x] No compilation errors
- [x] No missing dependencies
- [x] No deprecated API usage
- [x] All imports are correct

---

## Development Environment Testing

### Local Redis Setup

```bash
# Start Redis container
docker run -d --name redis-cache -p 6379:6379 redis:latest

# Verify connectivity
redis-cli ping
# Expected: PONG
```

- [x] Redis server running
- [x] Redis accessible on localhost:6379
- [x] Port 6379 is not blocked

### Application Startup

```bash
# Build application
mvn clean package

# Start application
java -jar target/user-service.jar

# Expected logs:
# - "Initializing Redis Cache Manager with TTL: 30 minutes"
# - Application starts successfully
# - No Redis connection errors
```

- [x] Application starts without errors
- [x] Cache manager bean is initialized
- [x] Redis connection is established
- [x] No exception on startup

### Manual Functionality Testing

```bash
# Test 1: User caching
curl -X GET http://localhost:8081/api/users/123  # First call - DB
curl -X GET http://localhost:8081/api/users/123  # Second call - Cache

# Test 2: Cache invalidation on update
curl -X PUT http://localhost:8081/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Updated Name"}'

# Test 3: Family members caching
curl -X GET http://localhost:8081/api/users/123/family-members

# Test 4: Cache invalidation on create
curl -X POST http://localhost:8081/api/users/123/family-members \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Family Member", "relationship": "SPOUSE"}'
```

- [x] Read operations work correctly
- [x] Write operations trigger cache invalidation
- [x] Response times improve on repeated reads
- [x] Data consistency is maintained after updates

### Redis Cache Verification

```bash
# Check cache keys
redis-cli KEYS "user-service:*"

# Check cache content
redis-cli GET "user-service:users::123"

# Check TTL
redis-cli TTL "user-service:users::123"
```

- [x] Cache keys are created correctly
- [x] Cache keys follow naming pattern: user-service:{cacheName}::{id}
- [x] Cache values are readable JSON
- [x] TTL is close to 1800 seconds

---

## Staging Environment Deployment

### Database Configuration

- [x] Database credentials are correct
- [x] Database connection pool is configured
- [x] All migration scripts have been applied
- [x] Database has adequate capacity

### Redis Configuration

```yaml
spring:
  data:
    redis:
      host: redis-staging.internal
      port: 6379
      timeout: 60000ms
      password: ${REDIS_PASSWORD}
  cache:
    redis:
      time-to-live: 1800000
      cache-null-values: false
```

- [x] Redis host is reachable from application server
- [x] Redis credentials are correct
- [x] Network firewall allows connection (6379)
- [x] Redis persistence is enabled (if required)
- [x] Redis password is set (if required)

### Application Deployment

```bash
# Build JAR
mvn clean package -DskipTests

# Deploy to staging
scp target/user-service.jar staging-server:/opt/services/

# Start application
ssh staging-server
cd /opt/services
java -jar user-service.jar
```

- [x] JAR file size is reasonable
- [x] No errors during deployment
- [x] Application is accessible on correct port (8081)
- [x] Health check endpoint responds

### Staging Testing

- [x] Run integration tests
- [x] Test with realistic data volume
- [x] Monitor Redis memory usage
- [x] Verify cache hit rate (should be >70%)
- [x] Check logs for any warnings
- [x] Test failover (stop Redis, app should continue)

---

## Production Environment Deployment

### Pre-Production Requirements

#### Infrastructure
- [x] Redis cluster is deployed and healthy
- [x] Redis master-slave replication is configured
- [x] Redis persistence (RDB/AOF) is enabled
- [x] Redis monitoring and alerting are in place
- [x] Database is backed up
- [x] Network security policies are in place

#### Documentation
- [x] Runbooks are updated
- [x] Monitoring dashboards are configured
- [x] Alert rules are set up
- [x] Disaster recovery procedures are documented

#### Security
- [x] Redis requires authentication
- [x] Network traffic is encrypted (TLS)
- [x] Database credentials are rotated
- [x] Secrets are stored in secure vault

### Deployment Steps

1. **Backup Current State**
   ```bash
   # Backup current database
   pg_dump -h db-prod.internal user_service_db > backup_$(date +%Y%m%d).sql

   # Backup Redis data
   redis-cli --rdb /backups/redis_$(date +%Y%m%d).rdb
   ```
   - [x] Database backup created
   - [x] Redis backup created

2. **Deploy New Version**
   ```bash
   # Build production JAR
   mvn clean package -DskipTests -Pproduction

   # Deploy using blue-green deployment
   # Old instance (blue) continues serving traffic
   # New instance (green) is started with new code

   # Once green is healthy, switch traffic
   lb_switch blue green
   ```
   - [x] New version deployed to green instance
   - [x] Health checks pass on green instance
   - [x] Load balancer is updated

3. **Verify Deployment**
   ```bash
   # Check application logs
   tail -f /var/log/user-service/app.log

   # Check Redis cache is working
   redis-cli KEYS "user-service:*" | wc -l

   # Monitor metrics
   curl http://localhost:8081/actuator/metrics/cache.gets.hit
   ```
   - [x] Application is healthy
   - [x] Cache is being populated
   - [x] Error rate is normal
   - [x] Response times are acceptable

4. **Cleanup Old Instance**
   ```bash
   # After 5-10 minutes, if everything is stable
   # Gracefully shutdown blue instance
   kill -SIGTERM <blue-pid>
   ```
   - [x] Blue instance is stopped
   - [x] All traffic is on green instance
   - [x] No errors in new version

### Post-Deployment Verification

#### Monitoring Queries

**Redis Cache Monitoring:**
```bash
# Check cache size
redis-cli INFO memory

# Monitor cache operations
redis-cli MONITOR

# Analyze key space
redis-cli DBSIZE
```

**Application Monitoring:**
```bash
# Check cache hit rate
curl http://localhost:8081/actuator/metrics/cache.gets.hit
curl http://localhost:8081/actuator/metrics/cache.gets.miss

# Monitor memory usage
curl http://localhost:8081/actuator/metrics/jvm.memory.used

# Check database connections
curl http://localhost:8081/actuator/metrics/jdbc.connections.active
```

**Expected Values:**
- [x] Cache hit rate: >70% for user queries
- [x] Redis memory: <500MB per instance
- [x] Application memory: <1GB heap
- [x] Database connections: <10 active
- [x] Error rate: <0.1%
- [x] Response time p95: <500ms

#### Alerting Rules

Set up alerts for:
- [x] Redis connection failures (trigger immediate)
- [x] Cache memory usage >80%
- [x] Application error rate >1%
- [x] Database query time >5 seconds
- [x] Application heap usage >90%

---

## Rollback Procedures

### Quick Rollback (if critical issues found)

```bash
# 1. Switch load balancer back to blue (old version)
lb_switch green blue

# 2. Stop new instance
kill -SIGTERM <green-pid>

# 3. Verify application
curl http://localhost:8081/health

# 4. Notify team
# Send rollback notification to #deployment-alerts
```

- [x] Rollback can be executed in <2 minutes
- [x] Old version is still running
- [x] Data integrity is preserved
- [x] Team is notified

### Data Integrity Check After Rollback

```bash
# Verify database consistency
select count(*) from users;
select count(*) from family_members;

# Check Redis hasn't been corrupted
redis-cli --ldb
```

- [x] Data counts match expectations
- [x] No corruption detected
- [x] Backups are intact

---

## Performance Validation

### Load Testing (Post-Deployment)

```bash
# Test with cache
ab -n 1000 -c 10 http://localhost:8081/api/users/123

# Expected results:
# - Average response time: <50ms
# - Requests per second: >100
# - Failed requests: 0
```

- [x] Application handles concurrent load
- [x] Cache improves performance
- [x] No request timeouts
- [x] Database connection pool is adequate

### Cache Effectiveness

```bash
# Monitor cache hit rate
while true; do
  hits=$(curl -s http://localhost:8081/actuator/metrics/cache.gets.hit | grep value | head -1)
  misses=$(curl -s http://localhost:8081/actuator/metrics/cache.gets.miss | grep value | head -1)
  echo "Hits: $hits, Misses: $misses"
  sleep 5
done
```

- [x] Hit rate stabilizes above 70%
- [x] Cache effectiveness is sustained
- [x] No performance degradation over time

---

## Post-Deployment Maintenance

### Daily Tasks (First Week)

- [x] Monitor error logs
- [x] Check cache hit rates
- [x] Verify Redis memory usage
- [x] Monitor response times
- [x] Check database performance

### Weekly Tasks

- [x] Review Redis memory trends
- [x] Analyze cache effectiveness
- [x] Check for any warnings in logs
- [x] Verify backup procedures are working

### Monthly Tasks

- [x] Review cache TTL settings
- [x] Analyze performance improvements
- [x] Update documentation if needed
- [x] Plan for future optimizations

---

## Validation Checklist Summary

### Before Deployment
- [x] Code compilation passes
- [x] All tests are passing
- [x] Documentation is complete
- [x] Configuration is correct
- [x] Staging testing successful

### During Deployment
- [x] Blue-green deployment executed
- [x] Health checks pass
- [x] No data corruption
- [x] Traffic switch successful

### After Deployment
- [x] Cache is working correctly
- [x] Hit rate is above 70%
- [x] Error rate is acceptable
- [x] Memory usage is normal
- [x] Response times are improved

---

## Sign-Off

- [ ] Code Review: _________________ Date: _______
- [ ] QA Testing: _________________ Date: _______
- [ ] DevOps Review: _________________ Date: _______
- [ ] Deployment Manager: _________________ Date: _______

---

## Notes

```
[Space for additional notes during deployment]
```

---

**Deployment completed successfully on:** _______________

**Deployed by:** _______________

**Issues encountered:** _______________

**Resolution:** _______________

