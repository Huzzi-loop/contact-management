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
4. [Data Model & Schema](#-data-model--schema)
5. [Concurrent Update Strategy (OCC)](#-concurrent-update-strategy-occ)
6. [Scale Considerations](#-scale-considerations)
7. [AI Usage Disclosure](#-ai-usage-disclosure)

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
