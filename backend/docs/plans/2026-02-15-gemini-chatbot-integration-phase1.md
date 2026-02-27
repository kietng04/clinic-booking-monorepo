# Gemini Chatbot (Phase 1) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a basic AI chatbot (text-only) to KLTN (Clinic Booking System) to assist PATIENT/DOCTOR/ADMIN users, backed by Google Gemini via REST API.

**Architecture:** New Spring Boot microservice `chatbot-service` calls Gemini REST API directly (no Spring AI), persists chat sessions/messages in its own Postgres DB via JPA + Flyway, is exposed through API Gateway, and is consumed by a global floating chatbot widget in the frontend.

**Tech Stack:** Spring Boot 3.2.1, Spring Cloud Gateway + Eureka, PostgreSQL + Flyway, Redis Cache, JWT (jjwt 0.11.5), Axios (frontend), Tailwind + framer-motion.

---

## Scope (Phase 1)

- Basic chat: send text, receive AI response
- Persist session + messages per user
- Role-based system prompt (PATIENT/DOCTOR/ADMIN)
- No RAG, no file uploads, no cross-service calls

## Key Constraints / Notes

- Backend parent uses Spring Boot 3.2.1 (`/Users/kietnguyen/Documents/kltn/clinic-booking-system/pom.xml`), so Spring AI 1.0+ (requires Boot 3.4.x) is not used. Call Gemini REST API directly.
- Local infra is Docker-first (`docker-compose.yml`) and host Postgres ports are already allocated:
  - 5433 user, 5434 appointment, 5435 medical, 5436 consultation, 5437 payment
  - Therefore chatbot DB host port must NOT be 5437. Use 5438 (recommended) or another free port.
- JWT claims are consistent across gateway/services:
  - `userId` (numeric), `role` (string), subject is email.
  - Gateway forwards `Authorization: Bearer ...` downstream, so chatbot-service can reuse the same JWT filter pattern as other services.

---

## Task 1: Create `chatbot-service` module (backend)

**Files:**
- Create: `chatbot-service/pom.xml`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/ChatbotServiceApplication.java`

**Steps:**
1. Create module folder `chatbot-service/` under backend repo.
2. Create `pom.xml` inheriting parent `com.clinicbooking:clinic-microservices-parent:1.0.0`.
3. Add dependencies (copy from consultation-service, but drop websocket + kafka + openfeign for Phase 1):
   - `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`
   - `spring-boot-starter-security`
   - `spring-boot-starter-actuator`
   - `spring-cloud-starter-netflix-eureka-client`
   - `postgresql`, `flyway-core`
   - `spring-boot-starter-data-redis`, `spring-boot-starter-cache`
   - `io.jsonwebtoken:jjwt-api/impl/jackson` (0.11.5)
   - `lombok`
   - `org.springdoc:springdoc-openapi-starter-webmvc-ui` (2.3.0)
   - `io.micrometer:micrometer-registry-prometheus`
   - test deps: `spring-boot-starter-test`, `spring-security-test`, `h2`
4. Create `ChatbotServiceApplication` with `@SpringBootApplication`, `@EnableDiscoveryClient`, `@EnableCaching`.

---

## Task 2: Service configuration + DB migration

**Files:**
- Create: `chatbot-service/src/main/resources/application.yml`
- Create: `chatbot-service/src/main/resources/db/migration/V1__Create_chatbot_tables.sql`

**Steps:**
1. Copy `consultation-service/src/main/resources/application.yml` structure.
2. Set:
   - `spring.application.name: chatbot-service`
   - `server.port: 8086`
   - `spring.datasource.url: jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5438}/${POSTGRES_DB:chatbot_service_db}`
   - Keep: hikari/jpa/flyway/redis/cache/eureka/jwt/management/springdoc/logging (remove kafka blocks).
3. Add Gemini config:
   - `ai.gemini.api-key: ${GEMINI_API_KEY}`
   - `ai.gemini.model: ${GEMINI_MODEL:gemini-2.5-flash}`
   - `ai.gemini.base-url: https://generativelanguage.googleapis.com/v1beta`
   - `ai.gemini.max-output-tokens: 1000`
   - `ai.gemini.temperature: 0.7`
   - `ai.gemini.timeout.connect: 10000`
   - `ai.gemini.timeout.read: 60000`
   - `ai.chat.max-history-messages: 10`
4. Add Flyway migration:
   - `chat_sessions`: id, user_id, user_role, started_at, last_message_at, status
   - `chat_messages`: id, session_id (FK), role ('user'|'model'), content, created_at
   - Add indexes (user_id, session_id).

---

## Task 3: Security + CORS (match existing patterns)

**Files:**
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/config/SecurityConfig.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/filter/JwtAuthenticationFilter.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/util/JwtUtil.java` (or reuse existing code pattern)

**Steps:**
1. Reuse the JWT validation pattern from other services:
   - Extract `userId` and `role` from claims.
   - Set Spring Security authentication with `ROLE_<role>`.
2. Pick ONE CORS approach to avoid conflicts:
   - Either configure CORS inside `SecurityConfig` (like consultation/payment), OR a separate `WebConfig` (like appointment/user).
3. Permit public endpoints: `/actuator/**`, `/api-docs/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
4. Protect `/api/chatbot/**` (authenticated).

---

## Task 4: Chat persistence + DTOs + endpoints

**Files:**
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/entity/ChatSession.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/entity/ChatMessage.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/repository/ChatSessionRepository.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/repository/ChatMessageRepository.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/dto/ChatRequestDto.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/dto/ChatResponseDto.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/dto/ChatSessionDto.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/controller/ChatbotController.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/service/ChatbotService.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/service/ChatbotServiceImpl.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/service/ChatHistoryService.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/exception/AIProviderException.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/exception/GlobalExceptionHandler.java`

**Endpoints (behind JWT):**
- `POST /api/chatbot/chat`  body `{ message, sessionId? }` -> `{ sessionId, message, timestamp }`
- `GET /api/chatbot/sessions` -> list sessions for current user
- `GET /api/chatbot/sessions/{id}` -> session details + messages (must enforce ownership)
- `DELETE /api/chatbot/sessions/{id}` -> delete session (must enforce ownership)

**Flow (ChatbotServiceImpl):**
1. Read `userId` + `role` from SecurityContext/JWT claims.
2. Get or create `ChatSession` (scoped to that user).
3. Load last N messages for context and build Gemini `contents[]`.
4. Build `system_instruction` using role-based prompt template.
5. Call Gemini client for response.
6. Save user message + model response in DB.
7. Return response DTO.

---

## Task 5: Gemini REST client

**Files:**
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/config/GeminiConfig.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/service/GeminiService.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/dto/gemini/GeminiRequest.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/dto/gemini/GeminiResponse.java`
- Create: `chatbot-service/src/main/java/com/clinicbooking/chatbotservice/util/PromptTemplates.java`

**HTTP call:**
- `POST {base-url}/models/{model}:generateContent`
- Headers:
  - `x-goog-api-key: <api-key>`
  - `Content-Type: application/json`

**Client config:**
- Prefer the existing style used in payment-service (`HttpClient5` pooling + timeouts) instead of `SimpleClientHttpRequestFactory`.

**Request shape (conceptual):**
```json
{
  "system_instruction": { "parts": [{ "text": "role system prompt" }] },
  "contents": [
    { "role": "user", "parts": [{ "text": "msg1" }] },
    { "role": "model", "parts": [{ "text": "resp1" }] },
    { "role": "user", "parts": [{ "text": "current message" }] }
  ],
  "generationConfig": { "temperature": 0.7, "maxOutputTokens": 1000 }
}
```

**Response parsing:**
- Use the first candidate text (guard nulls): `candidates[0].content.parts[0].text`

**Error handling:**
- Translate non-2xx Gemini responses to `AIProviderException` with safe message (do not leak api key).

---

## Task 6: Infrastructure integration (backend)

**Files:**
- Modify: `pom.xml` (add module)
- Modify: `api-gateway/src/main/resources/application.yml` (add route + cb instance)
- Modify: `docker-compose.yml` (add postgres-chatbot + chatbot-service containers)

**Steps:**
1. Parent POM: add `<module>chatbot-service</module>` after `consultation-service`.
2. API Gateway routes: add a new authenticated route:
   - `Path=/api/chatbot/**`
   - filters: `AuthenticationFilter` + `CircuitBreaker` with `fallbackUri: forward:/fallback`
3. Resilience4j: add `chatbot-service-cb` instance (copy thresholds from others).
4. Docker compose:
   - Add `postgres-chatbot` with host port 5438.
   - Add `chatbot-service` with port 8086 and env vars (DB, eureka, redis, jwt, gemini).
   - Add `postgres_chatbot_data` volume.

---

## Task 7: Frontend integration (widget + API)

**Files:**
- Create: `src/api/realApis/chatbotApi.js`
- Create: `src/api/chatbotApiWrapper.js`
- Modify: `src/api/mockApi.js` (add `chatbotApi` mock export)
- Create: `src/components/chatbot/ChatbotWidget.jsx`
- Modify: `src/App.jsx` (render `<ChatbotWidget />` after `</Routes>` but inside `<BrowserRouter>`)

**Notes:**
- Follow existing wrapper convention:
  - `const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'`
  - export `chatbotApi = USE_MOCK_BACKEND ? mockChatbotApi : realChatbotApi`
- Widget requirements:
  - floating button bottom-right, click to open panel
  - messages: left (AI) vs right (user), typing indicator
  - only render when authenticated (useAuthStore)
  - animations with framer-motion

---

## Task 8: Verification

**Backend:**
1. Create DB (docker compose recommended):
   - `docker-compose up -d postgres-chatbot`
2. Start Eureka + gateway + chatbot-service; confirm registration at `http://localhost:8761`.
3. Direct service test:
   - `curl -X POST http://localhost:8086/api/chatbot/chat -H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" -d '{"message":"Hello"}'`
4. Gateway test:
   - `curl -X POST http://localhost:8080/api/chatbot/chat -H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" -d '{"message":"Hello"}'`

**Frontend:**
1. Mock mode: `VITE_USE_MOCK_BACKEND=true` -> widget renders and returns mock after delay.
2. Real mode: `VITE_USE_MOCK_BACKEND=false` + backend up -> end-to-end chat works.
3. Multi-turn: verify last N messages are included (context).
4. Delete session: verify data removed and new session can start.

---

## Environment Variables

- `GEMINI_API_KEY` (required for real calls)
- `GEMINI_MODEL` (optional override, default `gemini-2.5-flash`)

