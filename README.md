# 🍼 Nurra — Motherhood Companion App

<div align="center">

![Nurra Logo](https://via.placeholder.com/120x120/E8948A/ffffff?text=Nurra)

**A smart, AI-powered parenting companion designed to support mothers through every stage of child care.**

[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?logo=argo)](https://argoproj.github.io/cd/)

[🌐 Live Demo](https://lnkd.in/dvxKuceZ) · [📱 Mobile App](#) · [📖 Docs](#documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [AI Architecture](#ai-architecture)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Team](#team)
- [License](#license)

---

## Overview

**Nurra** is a motherhood-focused full-stack web and mobile application built to support mothers during one of the most crucial phases of life — child care. From tracking vaccinations to connecting with a community of parents, Nurra brings everything a modern mother needs into one beautiful, AI-powered platform.

> Built as a BS Computer Science Senior Year Project at **Lahore University of Management Sciences (LUMS)** under the supervision of **Waqar Ahmad**, with guidance from Teaching Fellow **Muhammad Faraz**.

---

## Features

### 👶 Child Profile Management
- Register and manage multiple children under a single parent account
- Store key details: name, date of birth, gender, and profile photo
- Track age milestones automatically (2 months, 1 year, 2 years, etc.)
- Switch between children with an active child selection system

### 💉 Vaccination Tracking
- Log and monitor vaccination records for each child
- Receive reminders for upcoming vaccine doses
- Maintain a complete, secure health record history

### 📈 Growth Tracking
- Monitor children's physical development over time
- Visual progress indicators for weight, height, and developmental milestones

### 🤖 Nurtura AI — Personal Parenting Assistant
- Multi-tenant RAG-based + SQL agent AI assistant
- Answers questions about child growth, vaccinations, general parenting, and medical concerns
- Powered by Gemini (production) and LLaMA.cpp with Qwen2.5:4B (local inference)
- Context-aware responses tailored to your child's age and health profile

### 🎥 Tutorial Library
- Curated video tutorials across categories: Feeding, Bathing, Sleep Training, Health, Development, Safety
- Search and filter content by topic
- Embedded video playback within the app

### 💬 Community Forum
- Connect with other mothers in a safe, moderated space
- Create posts, comment, like, save, and share content
- Categorized discussions (e.g., Advice, Questions, Experiences)
- Community stats, activity tracking, and a Trust Score system

### 📊 Parenting Dashboard
- Personalized home screen with key metrics at a glance
- Trust Score — a reliability metric based on community engagement
- Unread community messages count
- Quick access to all core features

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **Relational DB** | PostgreSQL |
| **Document DB** | MongoDB (community/forum data) |
| **AI — Production** | Google Gemini API |
| **AI — Local** | LLaMA.cpp + Qwen2.5:4B model |
| **Vector Storage — Local** | FAISS |
| **Vector Storage — Production** | ChromaDB |
| **Media Storage** | Cloudinary |
| **Authentication** | JWT (Access + Refresh tokens, HS256) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (K8s) |
| **CI/CD** | ArgoCD (GitOps) |
| **Code Quality** | SonarQube |
| **Web Server** | Nginx (frontend production serving) |

---

## Project Structure

```
SPROJ/
├── .github/                        # GitHub Actions workflows
├── .scannerwork/                   # SonarQube scanner output
├── .vscode/                        # Editor settings
│
├── backend/                        # FastAPI Python backend
│   ├── app/                        # Main application package
│   │   ├── controllers/            # Route handler logic
│   │   ├── database/               # PostgreSQL & MongoDB connections
│   │   ├── llm_core/               # AI/LLM integration (Gemini, LLaMA.cpp, RAG, SQL agent)
│   │   ├── middleware/             # Auth, CORS, and request middleware
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── router/                 # FastAPI route definitions
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── sockets/                # WebSocket handlers
│   │   ├── utils/                  # Helper utilities
│   │   └── server.py               # Application entry point
│   ├── env/                        # Python virtual environment
│   ├── migrations/                 # Alembic database migrations
│   ├── .env                        # Backend environment variables
│   ├── .gitignore
│   ├── alembic.ini                 # Alembic config
│   ├── Dockerfile                  # Backend container image
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # React + TypeScript + Tailwind CSS
│   ├── public/                     # Static assets
│   ├── src/                        # Application source code
│   ├── .gitignore
│   ├── Dockerfile                  # Frontend container image (nginx)
│   ├── Dockerfile.vite             # Dev server Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf                  # Nginx config for production serving
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── k8s/                            # Kubernetes manifests
│
├── .gitignore
├── api.py                          # Top-level API entry / script
├── docker-compose.yaml             # Local multi-service dev setup
├── README.md
└── sonar-project.properties        # SonarQube code quality config
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL >= 14
- MongoDB >= 6.0
- Docker >= 24.x & Docker Compose v2
- A Cloudinary account (for media storage)
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nurra.git
cd nurra
```

### 2a. Run with Docker Compose (Recommended)

The easiest way to run the full stack locally:

```bash
cp .env.example .env        # Fill in your environment variables
docker compose up --build
```

This starts all services: frontend, backend, PostgreSQL, and MongoDB.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### 2b. Run Manually (Without Docker)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `/backend` directory with the following variables:

```env
# ── Database ──────────────────────────────────────────────
POSTGRES_DATABASE_URL=postgresql://user:password@localhost:5432/nurra_db
MONGO_DATABASE_URL=mongodb://localhost:27017/nurra_community

# ── Authentication ────────────────────────────────────────
ACCESS_SECRET=your_access_secret_here
REFRESH_SECRET=your_refresh_secret_here
SIGNER_KEY=your_signer_key_here
ALGORITHM=HS256
ACCESS_EXPIRY=50          # minutes
REFRESH_EXPIRY=7          # days

# ── AI ────────────────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Media Storage ─────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> ⚠️ **Never commit your `.env` file to version control.** Add it to `.gitignore`.

---

## AI Architecture

Nurra's AI assistant, **Nurtura AI**, uses a hybrid multi-tenant architecture:

```
User Query
    │
    ▼
┌─────────────────────────────────┐
│         Query Router            │
│  (Structured vs. Unstructured)  │
└────────────┬────────────────────┘
             │
    ┌─────────┴──────────┐
    ▼                    ▼
SQL Agent             RAG Pipeline
(PostgreSQL)          (FAISS / ChromaDB)
    │                    │
    └─────────┬──────────┘
              ▼
    ┌──────────────────┐
    │   LLM Backend    │
    │  Gemini (prod)   │
    │  Qwen2.5 (local) │
    └──────────────────┘
              │
              ▼
      Grounded Response
```

- **RAG Pipeline**: Retrieves relevant parenting knowledge from a curated vector database before generating a response.
- **SQL Agent**: Queries structured child health data (vaccinations, growth records) directly from PostgreSQL.
- **Multi-tenant**: Each parent's data is isolated — the AI only accesses data belonging to the authenticated user.

---

## Deployment

Nurra uses a modern GitOps deployment pipeline with Docker, Kubernetes, and ArgoCD.

### Overview

```
Developer Push
      │
      ▼
  GitHub Repo
      │
      ▼
  ArgoCD (GitOps)  ──── watches k8s/ manifests
      │
      ▼
Kubernetes Cluster
  ├── frontend-deployment
  ├── backend-deployment
  ├── ai-service-deployment
  ├── postgres-statefulset
  └── mongo-statefulset
```

### Docker

Each service has its own `Dockerfile`. Images are built and pushed to a container registry (e.g., Docker Hub or GHCR) as part of the CI pipeline.

```bash
# Build individual service images
docker build -t nurra/frontend ./frontend
docker build -t nurra/backend ./backend

# Run full stack locally
docker compose up --build
```

### Kubernetes

Kubernetes manifests live in the `/k8s` directory and define all workloads, services, config, and secrets.

```bash
# Apply all manifests to your cluster
kubectl apply -f k8s/

# Check running pods
kubectl get pods -n nurra

# Check services
kubectl get svc -n nurra
```

Key Kubernetes resources:

| Resource | Purpose |
|---|---|
| `Deployment` | Manages frontend, backend, and AI service pods |
| `StatefulSet` | PostgreSQL and MongoDB with persistent volumes |
| `ConfigMap` | Non-sensitive environment configuration |
| `Secret` | Database URLs, JWT secrets, API keys |
| `Ingress` | Routes external traffic to the correct service |
| `HorizontalPodAutoscaler` | Auto-scales backend pods based on load |

### ArgoCD (GitOps)

Nurra uses **ArgoCD** for continuous delivery. ArgoCD watches the `k8s/` directory in the Git repository and automatically syncs any changes to the Kubernetes cluster.

```bash
# Install ArgoCD on your cluster (one-time setup)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the Nurra ArgoCD Application manifest
kubectl apply -f argocd/application.yaml

# Access the ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

The `argocd/application.yaml` defines the sync policy, target cluster, and source repository. With auto-sync enabled, any merge to the `main` branch triggers a rolling deployment to the cluster — no manual `kubectl apply` needed.

```
Git Push to main
       │
       ▼
  ArgoCD detects diff
       │
       ▼
  Rolling Update on K8s
       │
       ▼
  Zero-downtime Deployment ✅
```

---

## Screenshots

| Dashboard | My Children | Tutorial Library |
|---|---|---|
| ![Dashboard](screenshots/dashboard.jpeg) | ![Children](screenshots/Children.jpeg) | ![Tutorials](screenshots/Tutorials.PNG) |

| Community Forum | Nurtura AI | Growth Tracking |
|---|---|---|
| ![Community](screenshots/community.PNG) | ![AI Chat](screenshots/AI.jpeg) | ![Growth](screenshots/growth.PNG) |
> 📸 Add your screenshots to a `/screenshots` folder at the root of the repository.

---

## API Overview

The backend exposes a RESTful API via FastAPI. Interactive docs are available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Key endpoint groups:

| Prefix | Description |
|---|---|
| `/auth` | Register, login, token refresh |
| `/children` | CRUD for child profiles |
| `/vaccinations` | Vaccination records and reminders |
| `/tutorials` | Browse and search tutorial content |
| `/community` | Posts, comments, likes, reports |
| `/ai/chat` | Nurtura AI assistant |

---

## Team

This project was built by a team of five students as a Senior Year Project.

| Name | Role |
|---|---|
| **Tooba Farooq** | Team Member |
| **Fiza Liaqat** | Team Member |
| **Sarah Hameed** | Team Member |
| **Dawood Ahmed** | Team Member |
| **Abid Karim** | Team Member |

**Supervisor:** Waqar Ahmad  
**Teaching Fellow:** Muhammad Faraz

---

## Live Demo

🌐 **[Try Nurra Live →](https://lnkd.in/dvxKuceZ)**

---

## License

This project is licensed for academic use. All rights reserved by the Nurra team, Lahore University of Management Sciences (LUMS).

---

<div align="center">
  Made with ❤️ for every mother, by a team that cares.
</div>