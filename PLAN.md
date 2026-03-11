# Commercial Lending Automation — Implementation Plan

## Overview

Build a new **`commercial-lending`** Kapp that implements an end-to-end commercial lending workflow. This is a POC for Publicis Sapient to demonstrate Kinetic Platform as a Pega replacement.

**Target audience:** Banking customers currently on Pega, evaluating Kinetic as modern alternative.
**Goal:** Flashy, demo-ready application showcasing workflow orchestration, AI augmentation, and modern UI.

---

## Phase 1: Platform Setup (Kapp, Teams, Attributes)

Create via MCP tools:

- **Kapp:** `commercial-lending` (name: "Commercial Lending")
- **Teams:** Relationship Managers, Credit Officers, Compliance Officers, Fraud Analysts, Loan Operations
- **Kapp Attribute Definitions:** Icon, Assigned Team, Notification Template Name - Create, SLA Hours
- **Form Attribute Definitions:** Icon, Assigned Team, SLA Hours, Stage
- **Form Types:** Service, Approval, Task, Review
- **Security Policy Definitions:** mirror service-portal

## Phase 2: Forms

| Form | Slug | Type | Purpose |
|------|------|------|---------|
| Loan Application | `loan-application` | Service | Main intake — borrower info, loan type, amount, business details |
| Document Upload | `document-upload` | Task | Collect required documents with file attachments |
| Pre-Screening Review | `pre-screening-review` | Review | RM reviews eligibility & compliance |
| Document Verification | `document-verification` | Task | AI results review, human fix for low confidence |
| Fraud Review | `fraud-review` | Review | Fraud analyst investigates flags |
| Credit Assessment | `credit-assessment` | Review | Credit officer reviews risk, financials |
| Loan Approval | `loan-approval` | Approval | Credit committee approval — approve/deny with conditions |
| Disbursement Checklist | `disbursement-checklist` | Task | Evidence-based checklist before funds release |
| Post-Disbursement Monitor | `post-disbursement-monitor` | Task | Ongoing monitoring — covenant tracking, repayment |

## Phase 3: Workflows

Main workflow on `loan-application` Submission Submitted:
```
Start → Pre-Screen → Document Collection → AI Verification → Fraud Check
→ Credit Assessment → Approval → Disbursement → Close
```

Each human step uses the Deferral pattern with child task submissions.

## Phase 4: Portal UI

### Pages (`portal/src/pages/lending/`)
- **LendingDashboard** (`/`) — KPI cards, stage funnel, recent applications
- **Pipeline** (`/pipeline`) — Kanban-style board by loan stage
- **ApplicationDetail** (`/applications/:id`) — Timeline view with stages, tasks, documents
- **MyQueue** (`/queue`) — Officer work queue with role-based filtering
- **NewApplication** (`/apply`) — CoreForm wrapper for loan-application

### Components (`portal/src/components/lending/`)
- StagePipeline — horizontal stepper showing loan progress
- MetricsCard — KPI card with icon, value, trend
- LoanCard — rich card for pipeline view
- StageKanban — kanban columns
- AuditTimeline — vertical activity timeline
- RiskBadge — color-coded risk indicator
- DocumentList — document status list

### Theme
- Professional banking: dark navy primary, gold accents, clean whites
- DaisyUI custom theme via kapp attributes

### Navigation
- Updated Header menu: Dashboard, Pipeline, My Queue, New Application
- Role-based menu items

## Phase 5: Demo Data

Seed 5-8 loan applications at various stages with linked tasks/approvals.

---

## Architecture Decisions

- Single `commercial-lending` kapp — all forms queried by `type`
- Parent/child submissions — Loan Application is parent; tasks reference via `Loan Application ID`
- Deferral pattern for all human review steps
- Form attributes drive work routing (`Assigned Team`)
- Simulated AI — mock confidence scores and fraud flags (real AI via Connection/Operation in production)

## Implementation Status: COMPLETE ✅

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Platform Setup | ✅ Done | Kapp, teams, attribute defs, form types, security policies |
| 2 — Forms | ✅ Done | All 9 forms created via `scripts/create-lending-forms.mjs` |
| 3 — Workflows | ✅ Done | Loan Application Submitted tree via `scripts/create-loan-workflow.mjs` |
| 4 — Portal UI | ✅ Done | 5 pages + 7 components, banking theme, updated nav |
| 5 — Demo Data | ✅ Done | 8 seeded applications at various stages via `scripts/seed-demo-data.mjs` |

### Workflow Details

The `Loan Application Submitted` workflow orchestrates:
```
New Submission
  → Pre-Screening Review (Task → Relationship Managers)
  → Document Verification (Task → Loan Operations)
  → Credit Assessment (Approval → Credit Officers)
  → Loan Approval (Approval → Credit Officers)
  → Complete
```

Each stage uses the deferral pattern — the parent workflow waits for the child task/approval to be completed before advancing.

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/create-lending-forms.mjs` | Creates all 9 lending forms in the platform |
| `scripts/seed-demo-data.mjs` | Seeds 8 demo loan applications at various pipeline stages |
| `scripts/create-loan-workflow.mjs` | Creates the Loan Application Submitted workflow |

### Running the Portal

```bash
cd portal && yarn start
```
Portal runs on port 3000 (configured in `vite.config.js`). Proxies API calls to `https://publicis-dev.kinops.io`.
