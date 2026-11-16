
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw ./
RUN chmod +x ./mvnw

RUN ./mvnw dependency:go-offline -B || true

COPY src ./src
RUN ./mvnw clean package -DskipTests


FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/target/*.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# Environment variables with sensible defaults
# Esto es para provar localmente se cambiaron TODOS en el deployment
ENV DB_HOST=localhost \
    DB_PORT=5432 \
    DB_NAME=sss001 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DDL_AUTO=update \
    SQL_INIT_MODE=always \
    JWT_SECRET=2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b \
    JWT_EXPIRATION=3600000 \
    NOTIFICATION_EMAIL_ENABLED=false \
    MAIL_HOST=localhost \
    MAIL_PORT=1025 \
    MAIL_USERNAME=no-reply@saludaltoque.local \
    MAIL_PASSWORD="" \
    MAIL_SMTP_AUTH=true \
    MAIL_SMTP_STARTTLS=true

# Run Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
