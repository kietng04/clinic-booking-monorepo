# Multi-stage build for Payment Service
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy parent pom first
COPY pom.xml ../pom.xml

# Copy service pom and source
COPY payment-service/pom.xml .
COPY payment-service/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/target/payment-service.jar app.jar

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
    
# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8084/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
