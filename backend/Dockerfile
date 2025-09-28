FROM gradle:8.10.2-jdk21 AS builder
WORKDIR /app

COPY build.gradle /app/
COPY src /app/src

RUN gradle clean bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /opt/app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/opt/app/app.jar"]
