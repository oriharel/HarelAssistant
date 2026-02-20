# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarelAssistant is a family personal assistant that sends scheduled Telegram and WhatsApp notifications via Vercel serverless functions. It evolved from a simple vitamin reminder into a general-purpose family reminder service. It also includes a **Real Estate CRM** for tracking leads on a property sale.

## Commands

- **Test locally**: `npm test` (runs `tsx test-notification.ts` — sends a test Telegram message)
- **Deploy**: Push to `main` triggers GitHub Actions deploy to Vercel production
- **Pair WhatsApp**: `BLOB_READ_WRITE_TOKEN=xxx tsx scripts/whatsapp-pair.ts` (one-time setup, shows QR code and lists groups)
- There is no build step locally; TypeScript compilation happens on Vercel during deployment.

## Architecture

### Notifications
- `api/remind.ts` — sends messages to Telegram via the Bot API (query param, POST body, or default message)
- `api/whatsapp.ts` — sends messages to a WhatsApp group via Baileys (query param or POST body, message required)
- `api/calendar-summary.ts` — fetches tomorrow's events from Google Calendar and sends a formatted summary to Telegram
- `api/lib/telegram.ts` — shared Telegram send helper

WhatsApp auth state is stored in Vercel Blob Storage (`api/lib/whatsapp-auth.ts`). One-time pairing is done via `scripts/whatsapp-pair.ts`.

### Real Estate CRM
- **API**: `api/crm/` — RESTful CRUD for leads, stage transitions, notes, funnel/source stats
- **Storage**: `api/lib/crm/` — types, Vercel Blob store (`crm/leads.json`), auth/validation helpers
- **Dashboard**: `public/crm/` — Alpine.js SPA (RTL Hebrew, mobile-first) served at `/crm`
- **Bump reminders**: `api/crm-bump.ts` — detects stale leads and sends Telegram alerts
- **Agent prompts**: `real-estate/agents/` — markdown persona files for Claude Code Task tool (orchestrator, content-writer, market-researcher, analytics-advisor)
- **Property data**: `real-estate/data/` — property details and listing templates

CRM API auth: `Authorization: Bearer <CRM_API_KEY>` header. Open if `CRM_API_KEY` env var is not set.

**Trigger mechanisms (three parallel systems):**
1. **Vercel cron** (`vercel.json`) — daily at 17:00 UTC with default message
2. **GitHub Actions** (`morning-reminder.yml`, `solo-walk-reminder.yml`, `crm-bump-reminder.yml`) — scheduled workflows that POST custom messages to endpoints
3. **Manual** — `workflow_dispatch` on the GitHub Actions, or direct HTTP request

## Environment Variables

Required in Vercel and locally (in `.env.local`):
- `TELEGRAM_BOT_TOKEN` — from Telegram BotFather
- `TELEGRAM_CHAT_ID` — target chat/user ID
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob Storage access token (for WhatsApp auth persistence)
- `WHATSAPP_GROUP_JID` — target WhatsApp group ID (e.g. `120363xxxxx@g.us`, found via pairing script)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Google service account JSON key (for calendar access)
- `GOOGLE_CALENDAR_ID` — comma-separated list of Google Calendar IDs to scan
- `CRM_API_KEY` — shared secret for CRM API auth (optional; API is open if not set)

## Tech Stack

- TypeScript (ESM) on Node.js
- Vercel serverless functions (`@vercel/node`)
- `node-fetch` for HTTP requests
- `@whiskeysockets/baileys` for WhatsApp Web API
- `@vercel/blob` for WhatsApp auth state persistence and CRM data
- Alpine.js (CDN) for CRM dashboard (zero build step)
- GitHub Actions for CI/CD and additional cron triggers

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch and open a PR.
- Branch naming: `feature/<short-description>` or `fix/<short-description>`

## Known Issues

- The Vercel production domain is still `vitamin-reminder.vercel.app` (legacy name). This is correct and working.
