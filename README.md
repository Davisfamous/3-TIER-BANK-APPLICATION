# 3-Tier Bank Application

A Spring Boot banking API with PostgreSQL persistence and Docker Compose support. The app exposes account, transaction, login, and budget note endpoints, and can optionally use Gemini for budget note generation.

## Tech Stack

- Java 21
- Spring Boot 4
- Spring Data JPA
- PostgreSQL 16
- Docker and Docker Compose
- Gemini API integration

## Run With Docker Compose

The compose file runs two containers:

- `db`: PostgreSQL
- `app`: `davisohwo/bank_app:latest` from Docker Hub

From the project root, set the required database password:

```powershell
$env:SPRING_DATASOURCE_PASSWORD="your_database_password"
```

Optional Gemini API key:

```powershell
$env:GEMINI_API_KEY="your_gemini_api_key"
```

Pull and start the services:

```powershell
docker compose pull app
docker compose up
```

The API will be available at:

```text
http://localhost:8080
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | No | JDBC URL. Docker Compose sets this to `jdbc:postgresql://db:5432/vaultwork_auth`. |
| `SPRING_DATASOURCE_USERNAME` | No | Database username. Defaults to `postgres`. |
| `SPRING_DATASOURCE_PASSWORD` | Yes | PostgreSQL password used by both the database and app containers. |
| `GEMINI_API_KEY` | No | API key for Gemini budget note generation. |

## Run Locally

Start only PostgreSQL with Docker Compose:

```powershell
$env:SPRING_DATASOURCE_PASSWORD="your_database_password"
docker compose up db
```

In another terminal, run the Spring Boot app:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/vaultwork_auth"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_database_password"
.\mvnw.cmd spring-boot:run
```

## Common Docker Notes

When the app runs inside Docker, do not use `localhost` for the database host. Inside a container, `localhost` means the app container itself. Use the Compose service name instead:

```text
jdbc:postgresql://db:5432/vaultwork_auth
```

If you run the app manually with `docker run`, you must also run PostgreSQL on the same Docker network and pass the correct Spring environment variables:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
GEMINI_API_KEY
```

## Useful Commands

List local images:

```powershell
docker images
```

Push the local image to Docker Hub:

```powershell
docker tag bank-app:latest davisohwo/bank_app:latest
docker push davisohwo/bank_app:latest
```

Stop and remove containers, networks, and the database volume:

```powershell
docker compose down -v
```
