# Spring Admin System

A practical Spring Boot admin backend using Maven, MyBatis Plus, MySQL, Spring Security and JWT.

## Requirements

- Java 17+
- Maven 3.9+
- MySQL 8+

## Run

1. Create database `spring_admin`.
2. Execute `src/main/resources/db/schema.sql`.
3. Copy `src/main/resources/application-local.yml.example` to `application-local.yml` and fill in your MySQL password and JWT secret.
4. Start the app:

```bash
mvn spring-boot:run
```

Default account:

- Username: `admin`
- Password: `password`
