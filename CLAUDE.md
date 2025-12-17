# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive web application that automates GDPR/CCPA data deletion requests. Scans Gmail inboxes for data broker communications, generates legally compliant deletion requests, automatically sends emails via Gmail API, tracks broker responses with daily automated scans, and provides analytics dashboards for success metrics and broker compliance.

## Architecture

Full-stack application with automated background processing:

**Frontend (React + TypeScript)**
- Interactive dashboard with success metrics and quick actions
- Email scanner with configurable parameters
- Deletion request creation and management
- Broker response tracking with type classification
- Analytics dashboard with charts (recharts)
- Real-time data fetching with React Query

**Backend (Python FastAPI)**
- Gmail OAuth2 integration for inbox access
- Email scanning and data broker detection with confidence scoring
- Deletion request generation with GDPR/CCPA templates
- Automated email sending via Gmail API
- Response tracking with automatic detection and classification
- Celery workers for background task processing
- Celery Beat for scheduled daily response scans
- Analytics service for success metrics and compliance tracking

**Data Layer**
- PostgreSQL for users, brokers, deletion requests, responses, email scans
- Redis for Celery task queue and message broker
- Gmail API for email access (OAuth2 scopes: readonly + send)
- Encrypted OAuth token storage using Fernet

## Tech Stack

**Backend**: FastAPI, SQLAlchemy, Celery, Celery Beat, Google Gmail API, Pydantic, Cryptography
**Frontend**: React 18, TypeScript, Vite, TanStack Query (React Query), Zustand, React Router, shadcn/ui, Tailwind CSS, Recharts
**Infrastructure**: Docker Compose, Nginx, PostgreSQL 15, Redis 7

## Project Structure

```
backend/app/
├── models/          # SQLAlchemy models (User, DataBroker, DeletionRequest, EmailScan, BrokerResponse)
├── services/        # Business logic (gmail_service, email_scanner, broker_detector, response_detector,
│                    #   response_matcher, analytics_service, deletion_request_service)
├── api/             # FastAPI routes (auth, emails, brokers, requests, responses, analytics)
├── tasks/           # Celery background tasks (scan_inbox_task, scan_for_responses_task,
│                    #   scan_all_users_for_responses)
├── schemas/         # Pydantic request/response schemas
├── utils/           # Email templates (GDPR/CCPA) and helpers
├── celery_app.py    # Celery configuration with Beat scheduling
└── config.py        # Settings and environment configuration

frontend/src/
├── components/      # React components
│   ├── auth/        # LoginPage, AuthCallback, AuthGuard
│   ├── dashboard/   # Dashboard with success metrics
│   ├── emails/      # EmailScanner, EmailList
│   ├── brokers/     # BrokerList
│   ├── requests/    # RequestList, EmailPreviewDialog
│   ├── responses/   # ResponseList with filtering
│   ├── analytics/   # AnalyticsDashboard with charts
│   ├── layout/      # Layout, Navigation
│   └── ui/          # shadcn/ui components (Button, Card, Badge, etc.)
├── hooks/           # Custom React hooks (useAuth, useEmails, useBrokers, useRequests,
│                    #   useResponses, useAnalytics)
├── services/        # API client (axios with all endpoints)
├── stores/          # Zustand state management (authStore)
└── types/           # TypeScript type definitions
```

## Development Commands

**Full stack (Docker)**:
```bash
docker-compose up --build
```

**Backend (local development)**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# In separate terminals:
celery -A app.celery_app worker --loglevel=info
celery -A app.celery_app beat --loglevel=info
```

**Frontend (local development)**:
```bash
cd frontend
npm install
npm run dev
```

**Access points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Setup

Create `.env` in project root with:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
DATABASE_URL=postgresql://postgres:postgres@db:5432/antispam
REDIS_URL=redis://redis:6379/0
SECRET_KEY=...  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
ENCRYPTION_KEY=...  # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
ENVIRONMENT=development
VITE_API_URL=http://localhost:8000
```

## Key Features Implemented

### Response Tracking System
- Automatic detection of broker responses from inbox
- Keyword-based classification into 5 types: confirmation, rejection, acknowledgment, request_info, unknown
- Rule-based confidence scoring (0.0-1.0) using keyword match counts
- Matching responses to deletion requests using thread_id, subject, or domain
- Auto-status updates for requests based on high-confidence responses (≥60%)
- Daily automated scans at 2 AM UTC via Celery Beat

### Analytics Dashboard
- Success rate calculation (confirmations / sent requests)
- Average response time tracking (days from sent to confirmation)
- Timeline charts showing requests sent vs confirmations (7/30/90 day views)
- Broker compliance ranking (success rate + avg response time)
- Response type distribution pie chart
- Powered by recharts library

### Automated Background Processing
- Celery workers for async email scanning and response detection
- Celery Beat scheduling for daily response scans
- Task status tracking with progress updates
- scan_inbox_task: Scans user inbox for broker emails
- scan_for_responses_task: Scans for broker responses to deletion requests
- scan_all_users_for_responses: Daily task scanning all users with sent requests

### Frontend Features
- Full React SPA with TypeScript
- React Query for data fetching and caching
- Zustand for auth state management
- shadcn/ui components for consistent design
- Tailwind CSS for styling
- 7 main pages: Dashboard, Scan Emails, Email Results, Data Brokers, Deletion Requests, Broker Responses, Analytics

## Key Security Considerations

- OAuth tokens encrypted at rest using Fernet symmetric encryption
- Email content never logged to files or console
- All deletion requests legally compliant with GDPR/CCPA
- Environment variables for all sensitive credentials
- Secure PostgreSQL and Redis connections
- CORS configured for localhost development
