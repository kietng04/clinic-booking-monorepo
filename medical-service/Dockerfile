# Multi-stage build for Medical Service
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy parent pom first
COPY pom.xml ../pom.xml

# Copy service pom and source
COPY medical-service/pom.xml .
COPY medical-service/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/target/medical-service.jar app.jar

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8083/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
