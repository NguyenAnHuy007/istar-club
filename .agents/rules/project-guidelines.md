---
trigger: always_on
---

---
description: Rules for codebase consistency and documentation updates on Java and Next.js projects
globs: **/*.java, **/*.js, **/*.jsx, **/*.ts, **/*.tsx
---

# Development Rules & Guidelines

## 1. Mandatory Documentation Update
- Every time a `.java` file inside the Spring Boot backend is created, modified, or deleted, you MUST review and update `OVERVIEW.md`.
- Ensure `OVERVIEW.md` accurately reflects:
  - Any new, modified, or deprecated API Endpoints.
  - Changes in service logic, data models, or backend architecture.
  - Impact on the corresponding Next.js frontend integrations.

## 2. Pre-implementation Codebase Search
- Before creating any new feature, API, or module:
  - Search the existing codebase (both Spring Boot backend and Next.js frontend) to locate related logic, utilities, models, or components.
  - Re-use existing patterns, configurations, and helper functions to prevent code duplication.
  - Identify all dependent files that need to be updated alongside the new feature.

## 3. Tech Stack Conventions
- **Backend:** Java Spring Boot
  - Follow standard layered architecture: Controller -> Service -> Repository / DTO.
- **Frontend:** Next.js (TypeScript/JavaScript)
  - Ensure API client calls correctly match updated Spring Boot controllers.