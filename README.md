# CRM Contact Workspace

A full-stack, enterprise-grade CRM contact management application built with a focus on data integrity, high-throughput search, auditability, and optimistic concurrency control.

---

## 📌 Overview

This project is an end-to-end CRM workspace allowing teams to browse, search, filter, update, and bulk-tag contacts. It is architected to handle high-frequency concurrent operations safely without distributed locks, maintaining complete audit history and strict data integrity under soft deletes.

### Key Highlights
- **Full-Stack Type Safety**: End-to-end TypeScript spanning Express REST APIs and React 19.
- **Optimistic Concurrency Control (OCC)**: Atomic `version`-checked writes preventing lost updates with interactive client-side conflict resolution.
- **Server-Driven Querying**: High-performance backend pagination, sorting, multi-field search (name, email, phone), and multi-criteria filtering (tags, company).
- **Audit & Activity Tracking**: Append-only event history tracking contact modifications, tag assignments, and removals.
- **Data Integrity**: Soft deletes paired with PostgreSQL partial unique indexes to guarantee email uniqueness only across active records.

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Quickstart & Setup](#-quickstart--setup)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Important Technical Decisions](#-important-technical-decisions)
5. [Data Model & Schema](#-data-model--schema)
6. [Concurrent Update Strategy (OCC)](#-concurrent-update-strategy-occ)
7. [Scale Considerations](#-scale-considerations)
8. [AI Usage Disclosure](#-ai-usage-disclosure)

---

## 🚀 Quickstart & Setup

Follow these steps to get the full stack running locally in under 3 minutes.

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **npm**: `v9+`
- **PostgreSQL**: A running instance (local or hosted)

### 2. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd crm
npm install
```

### 3. Environment Configuration
Before running the application or database migrations, set up your environment variables from the provided templates:

* **Backend (`backend/.env`)**:
  ```bash
  cp backend/.env.example backend/.env
  ```
  Open `backend/.env` and update the `DATABASE_URL` with your PostgreSQL credentials:
  ```env
  PORT=5001
  NODE_ENV=development
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db"
  ```

* **Frontend (`frontend/.env`)**:
  ```bash
  cp frontend/.env.example frontend/.env
  ```
  The default configuration connects to the local backend proxy:
  ```env
  VITE_API_BASE_URL=/api/v1
  ```

### 4. Database Setup & Seeding
Ensure your target PostgreSQL database exists. Then push the Drizzle schema and seed realistic demo data (contacts, tags, and activity history):
```bash
# Push schema and populate seed data in one step
npm run db:setup
```
*(Or run them individually: `npm run db:push` to apply schema, followed by `npm run db:seed` to seed data).*

### 5. Start the Application
Launch both backend and frontend concurrently with a single command:
```bash
npm run dev
```
* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5001](http://localhost:5001) (Health check: [http://localhost:5001/health](http://localhost:5001/health))

> *Tip: You can also run them in separate terminals if preferred using `npm run dev:backend` and `npm run dev:frontend`.*

### 6. Run the Test Suite
Execute all unit, service, validator, and component tests across the monorepo:
```bash
npm test
```


---

## 🏛️ Architecture & Tech Stack

The system is built with a focus on simplicity, execution speed, and explicit design patterns that avoid framework magic.

### 1. Backend Architecture: Express.js (TypeScript) & 3-Tier Layered Pattern
* **Rationale**: We deliberately selected Express.js because we wanted a lean, lightweight backend that spins up fast without framework bloat. Prior hands-on production experience with Express allowed us to assemble a clean architecture without fighting framework abstractions.
* **Separation of Concerns**: We structured the application into an explicit 3-tier architecture:
  * **Controllers** (`modules/*/contact.controller.ts`): Responsible strictly for HTTP protocol concerns, extracting validated inputs, setting HTTP status codes (`200`, `201`, `409`), and dispatching responses.
  * **Services** (`modules/*/contact.service.ts`): Pure business logic—enforcing OCC checks, uniqueness validation, coordinating multi-step workflows, and logging audit history.
  * **Repositories** (`modules/*/contact.repository.ts`): The database access layer encapsulating all Drizzle ORM queries, transactions, and raw SQL expressions.

### 2. ORM & Query Layer: Drizzle ORM
* **Rationale**: Drizzle acts as a thin TypeScript SQL builder. It compiles queries with zero runtime overhead, provides complete visibility into the generated SQL, and delivers native support for PostgreSQL-specific features like partial indexes, composite primary keys, and `ON CONFLICT DO NOTHING`.
* **Prisma Comparison**: Unlike heavier ORMs like Prisma, Drizzle does not rely on an opaque external query-engine binary or hidden query translations, making atomic expressions (like `version = version + 1`) concise and transparent.

### 3. Database: PostgreSQL
* **Rationale**: Selected strictly for its industry-standard **ACID compliance**, which is non-negotiable for:
  * **Atomic OCC Version Bumps**: Ensuring the version comparison (`WHERE version = :expected`) and increment (`version = version + 1`) happen as an atomic database operation.
  * **Transactional Bulk Tagging**: Guaranteeing that tagging dozens of contacts simultaneously either commits completely or rolls back safely.
  * **Synchronous Audit Logging**: Guaranteeing that contact state changes and their corresponding audit entries in `contact_activities` commit in the exact same transaction.

---

## 💡 Important Technical Decisions & Tradeoffs

### 1. Optimistic Concurrency Control (OCC) vs Serializable Transactions
* **Problem**: In a web CRM, User A and User B can open the same contact record simultaneously. User B saves a modification at 10:02 AM. User A finishes reviewing their notes and clicks "Save" at 10:05 AM.
* **Why not Serializable Transactions?** A database transaction cannot remain open across HTTP requests during human "think-time". Keeping a database transaction open for minutes while a user types would:
  1. Exhaust database connection pool limits.
  2. Hold table/row locks, causing cascading aborts (`40001 serialization_failure`) for unrelated operations.
  3. Risk gateway and database transaction timeouts.
* **Our Solution**: Lightweight **Optimistic Concurrency Control (OCC)** using an integer `version` column. Database operations stay millisecond-short:
  ```sql
  UPDATE contacts 
  SET first_name = :first_name, ..., version = version + 1, updated_at = NOW()
  WHERE id = :id AND version = :submittedVersion AND deleted_at IS NULL
  RETURNING *;
  ```
  If `0` rows match, another user modified the contact first. The backend immediately returns `409 Conflict` containing the current server record, enabling the client UI to present a merge/reload modal without losing the user's context.

### 2. Natural Idempotency vs Idempotency Keys in Headers
Instead of introducing distributed state with an `Idempotency-Key` header and a short-lived Redis cache, our database schema and SQL operations are **naturally idempotent**:
* **Contact Creation**: The partial unique index on `email` prevents duplicate contact creation on network retries or rapid double-clicks.
* **Contact Updates**: OCC `version` checking makes updates naturally idempotent. If a client retries an update request with `version: 2`, the first request succeeds (updating the record to `version: 3`), and the duplicate retry fails safely with `409 Conflict` rather than reapplying stale data.
* **Tag Assignment**: The junction table uses `ON CONFLICT DO NOTHING`. Retrying a tag assignment request multiple times produces the exact same end state without duplicate associations or errors.

### 3. Non-Unique Phone Numbers: Business & Data Integrity Rationale
While `email` is enforced as unique among active contacts, `phone` is deliberately allowed to have duplicates:
* Multiple contacts frequently share corporate switchboards (`+1-800-555-0100`), reception desks, or primary office lines.
* In B2B sales pipelines, executive assistants, sales reps, and founders often share identical company phone numbers.
* While **email** is a globally unique digital identity anchor, a phone number represents a shared communication channel. Enforcing phone uniqueness would break real-world contact ingestion.

### 4. Email Handling: Active vs Soft-Deleted Records
* **Active Contact Collision**: If an email is already assigned to an active contact (`deleted_at IS NULL`), any duplicate attempt triggers a `409 Conflict` (`"Email already exists"`).
* **Soft-Deleted Contact**: We use a PostgreSQL **partial unique index**:
  ```sql
  CREATE UNIQUE INDEX idx_contacts_active_email ON contacts (email)
  WHERE deleted_at IS NULL AND email IS NOT NULL;
  ```
  If a contact was soft-deleted, their email is immediately freed up. A new contact can be created with that email address without breaking referential integrity or requiring destructive email-string mangling hacks (e.g. `user@example.com_deleted_1710000000`).

### 5. Offset-Based Pagination vs Keyset/Cursor-Based Pagination
* **Why Offset Currently?** CRM tabular interfaces require **random page access** (e.g., jumping directly to page 5) and displaying **total count / total pages** (`meta: { total, totalPages }`). Offset-based pagination (`LIMIT :limit OFFSET :offset`) supports this out of the box.
* **What would change for Cursor-based Pagination?**
  * **API Contract**: Replace `?page=2&limit=20` with `?cursor=<encoded_timestamp_id>&limit=20`.
  * **Query**: Replace `OFFSET` with a keyset predicate:
    ```sql
    WHERE (created_at, id) < (:cursor_created_at, :cursor_id)
    ORDER BY created_at DESC, id DESC LIMIT :limit;
    ```
  * **Gains**: $O(1)$ query execution time regardless of page depth. Offset pagination degrades at scale ($O(N)$) because PostgreSQL must scan and discard all rows prior to the offset.
  * **Trade-off**: Users lose the ability to jump to arbitrary pages or see exact total pages; navigation becomes purely "Next / Previous" or infinite scroll.

### 6. Multi-Field Search Implementation & Indexing Alternatives
* **Current Implementation**:
  ```sql
  WHERE (
    first_name ILIKE '%term%' OR 
    last_name ILIKE '%term%' OR 
    email ILIKE '%term%' OR 
    phone ILIKE '%term%' OR
    LOWER(first_name || ' ' || last_name) LIKE LOWER('%term%')
  )
  ```
* **Did we add an index for search?** No standard B-tree index is applied to the search fields because B-tree indexes cannot accelerate leading wildcard patterns (`'%term%'`).
* **Alternatives Evaluated**:
  1. *Generated `tsvector` Column + GIN Index*: Stores tokenized terms in a dedicated column for PostgreSQL Full-Text Search. *Tradeoff*: Excellent for full words, but fails for partial substring matches (e.g., typing `"ohn"` for `"John"`).
  2. *Trigram Index (`pg_trgm`)*: `CREATE INDEX ... USING gin (field gin_trgm_ops)`. The best native PostgreSQL solution for accelerating arbitrary substring `ILIKE` queries at scale.
  3. *External Search Engine (Elasticsearch / Meilisearch)*: Offloads search load entirely from the primary transactional database.

### 7. Atomic Bulk Tagging & Concurrency Management
* **Mechanism**: Bulk tag operations run inside an atomic database transaction. The service validates that all target `contactIds` and `tagIds` exist before executing a bulk insert with `ON CONFLICT DO NOTHING`.
* **Concurrency Handling**: If two administrators simultaneously assign the same tag to overlapping contacts, PostgreSQL handles this gracefully via row-level locks on the junction table. The `ON CONFLICT DO NOTHING` clause prevents duplicate key violations.
* **OCC Decoupling**: Bulk tag operations do not bump the contact's `version` column. Tagging represents a relationship change rather than a modification to contact entity fields, preventing false-positive OCC conflicts during batch operations.

### 8. Normalized Junction Table (`contact_tags`) vs Array/JSONB Columns
* **Why a Junction Table?** Standard 3NF design. It supports metadata per association (`assigned_at`), enables bi-directional querying (finding tags for a contact, or contacts for a tag), and supports `ON DELETE CASCADE`.
* **Alternatives Evaluated**:
  1. *PostgreSQL Array Column (`tags text[]` or `tag_ids uuid[]`)*: Faster for simple reads, but updating a tag's name or color requires updating every single contact row. Also lacks foreign key referential integrity.
  2. *JSONB Column (`tags jsonb`)*: Same downsides as arrays with increased storage overhead and loss of strict relational schema constraints.

### 9. Eliminating N+1 Queries on Tag Loading
In `findAllActive` and `findContacts`, instead of querying tags per contact in a loop, we fetch contacts first, extract their IDs, and batch-fetch all associated tags in a single query:
```sql
SELECT contact_id, tags.* FROM contact_tags 
INNER JOIN tags ON contact_tags.tag_id = tags.id 
WHERE contact_id IN (...);
```
We then group them in-memory using a hash map. This guarantees exactly **2 database queries** regardless of whether the page limit is 10 or 100.

### 10. Dedicated Append-Only Audit History (`contact_activities`)
Rather than relying on database triggers or overwriting previous states, mutations (`CONTACT_UPDATED`, `TAG_ADDED`, `TAG_REMOVED`, `CONTACT_DELETED`) write to an immutable `contact_activities` table with `type`, `description`, and `metadata (JSONB)`. This provides a complete audit trail without altering the primary contact schema.

### 11. Fail-Fast Boundary Validation with Joi Middleware
All route inputs (`params`, `query`, `body`) are validated via reusable middleware before reaching controller code. This ensures malformed data is rejected at the HTTP boundary, keeping service logic free of defensive type and presence checks.


---

## 🗄️ Data Model & Schema

The database design adheres to 3rd Normal Form (3NF) with explicit foreign key cascading rules, partial unique indexing, and an append-only audit trail.

### Entity-Relationship Diagram

```mermaid
erDiagram
    CONTACTS ||--o{ CONTACT_TAGS : "has many"
    TAGS ||--o{ CONTACT_TAGS : "tagged in"
    CONTACTS ||--o{ CONTACT_ACTIVITIES : "records"

    CONTACTS {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar email "NULLABLE, Partial Unique"
        varchar phone "NULLABLE"
        varchar company "NULLABLE, Indexed"
        integer version "Default: 1 (OCC)"
        timestamp deleted_at "NULLABLE (Soft Delete, Indexed)"
        timestamp created_at "Indexed"
        timestamp updated_at
    }

    TAGS {
        uuid id PK
        varchar name "UNIQUE"
        varchar color "Hex code"
        timestamp created_at
        timestamp updated_at
    }

    CONTACT_TAGS {
        uuid contact_id PK, FK "ON DELETE CASCADE"
        uuid tag_id PK, FK "ON DELETE CASCADE"
        timestamp assigned_at
    }

    CONTACT_ACTIVITIES {
        uuid id PK
        uuid contact_id FK "ON DELETE CASCADE"
        varchar type "CONTACT_CREATED, CONTACT_UPDATED, TAG_ADDED, etc."
        text description
        jsonb metadata "Diff details"
        timestamp created_at "Indexed with contact_id"
    }
```

### Schema & Indexing Specifications

| Table | Primary Key | Key Columns | Indexes & Constraints |
| :--- | :--- | :--- | :--- |
| **`contacts`** | `id` (UUIDv4) | `first_name`, `last_name`, `email`, `phone`, `company`, `version` | • **Partial Unique**: `idx_contacts_active_email` on `email` (`WHERE deleted_at IS NULL AND email IS NOT NULL`)<br>• **B-tree Indexes**: `company`, `created_at`, `deleted_at` |
| **`tags`** | `id` (UUIDv4) | `name`, `color` | • **Unique Constraint**: `name` (prevents case-sensitive duplicate tag labels) |
| **`contact_tags`** | `(contact_id, tag_id)` | `contact_id`, `tag_id`, `assigned_at` | • **Composite PK**: Guarantees a tag can only be linked once to a contact<br>• **Foreign Keys**: `ON DELETE CASCADE` on both references<br>• **B-tree Index**: `tag_id` for fast reverse tag lookups |
| **`contact_activities`** | `id` (UUIDv4) | `contact_id`, `type`, `description`, `metadata` (JSONB), `created_at` | • **Compound Index**: `idx_activities_contact_created` on `(contact_id, created_at DESC)` for sub-millisecond timeline queries |

### Integrity & Lifecycle Guarantees
1. **Cascade Isolation**: Deleting a tag deletes all associated rows in `contact_tags` via `ON DELETE CASCADE` without affecting the contacts themselves.
2. **Soft-Delete Preservation**: Deleting a contact sets `deleted_at = NOW()`. Associated `contact_tags` and `contact_activities` remain preserved in the database for auditability and compliance.
3. **Audit Immutability**: The `contact_activities` table is append-only. There are no `UPDATE` or `DELETE` endpoints exposed for activity logs.
