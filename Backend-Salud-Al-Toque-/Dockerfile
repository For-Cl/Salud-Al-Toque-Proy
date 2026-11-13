# ============================================================
# Stage 1: Build application using Maven
# ============================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy dependency descriptors first for layer caching
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw ./
RUN chmod +x ./mvnw

# Download dependencies offline
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ============================================================
# Stage 2: Lightweight production runtime image
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root group and user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Set permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Expose default Spring Boot port
EXPOSE 8080

# Environment variables with sensible production defaults
# Esto es para provar localmente se cambiaron TODOS en el deployment
ENV DB_HOST=localhost \
    DB_PORT=5432 \
    DB_NAME=sss001 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    JWT_SECRET=2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b \
    JWT_EXPIRATION=3600000 \
    NOTIFICATION_EMAIL_ENABLED=false \
    JAVA_OPTS="-Xms256m -Xmx512m"

# Run Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

