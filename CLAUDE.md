# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarelAssistant is a family personal assistant that sends scheduled Telegram and WhatsApp notifications via Vercel serverless functions. It evolved from a simple vitamin reminder into a general-purpose family reminder service. It also includes a **Real Estate Sales Assistant** with agent prompts, market research, and listing content.

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

WhatsApp auth state is stored in Vercel Blob Storage (`api/lib/whatsapp-auth.ts`). One-time pairing is done via `scripts/whatsapp-pair.ts`.

### Real Estate Sales Assistant
- **Agent prompts**: `real-estate/agents/` — markdown persona files for Claude Code Task tool (orchestrator, content-writer, market-researcher, analytics-advisor)
- **Property data**: `real-estate/data/property.md` — property details and active listing URLs
- **Market analysis**: `real-estate/data/market-analysis-2026-02.md` — macro data, comps, pricing
- **Listing content**: `real-estate/content/listing-copy.md` — ready-to-paste copy per platform + bump variants
- **Platform research**: `real-estate/research/platform-strategy.md` — Facebook groups, platforms, bump schedule
- **Listing templates**: `real-estate/data/listing-templates.md` — platform-specific templates
- **Photos**: `real-estate/assets/images/` — property photos

Note: A CRM web app (API + dashboard) was designed but is not deployed due to Vercel hobby plan limits. The code can be re-added when upgrading to a paid plan.

**Trigger mechanisms (three parallel systems):**
1. **Vercel cron** (`vercel.json`) — daily at 17:00 UTC with default message
2. **GitHub Actions** (`morning-reminder.yml`, `solo-walk-reminder.yml`) — scheduled workflows that POST custom messages to the endpoint
3. **Manual** — `workflow_dispatch` on the GitHub Actions, or direct HTTP request

## Environment Variables

Required in Vercel and locally (in `.env.local`):
- `TELEGRAM_BOT_TOKEN` — from Telegram BotFather
- `TELEGRAM_CHAT_ID` — target chat/user ID
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob Storage access token (for WhatsApp auth persistence)
- `WHATSAPP_GROUP_JID` — target WhatsApp group ID (e.g. `120363xxxxx@g.us`, found via pairing script)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Google service account JSON key (for calendar access)
- `GOOGLE_CALENDAR_ID` — comma-separated list of Google Calendar IDs to scan

## Tech Stack

- TypeScript (ESM) on Node.js
- Vercel serverless functions (`@vercel/node`)
- `node-fetch` for HTTP requests
- `@whiskeysockets/baileys` for WhatsApp Web API
- `@vercel/blob` for WhatsApp auth state persistence
- GitHub Actions for CI/CD and additional cron triggers

## Real Estate Agents

The `real-estate/agents/` directory contains markdown persona prompts for assisting with the property sale. Run them using the Task tool (subagent_type=general-purpose), passing the agent's prompt file as context. Agents read property data from `real-estate/data/property.md` and listing templates from `real-estate/data/listing-templates.md`.

Available agents:
- **orchestrator.md** — Master coordinator. Does daily funnel review, identifies stale leads, delegates to other agents. Run this first for a status briefing.
- **content-writer.md** — Hebrew listing copywriter. Generates/improves Yad2, Facebook, Madlan listings, bump text variants, photo captions.
- **market-researcher.md** — Platform strategy, bump timing (הקפצה), Facebook group recommendations, competitive pricing analysis.
- **analytics-advisor.md** — Funnel conversion analysis, pricing assessment, negotiation strategy. Most useful once CRM has data.

**How to invoke**: When the user asks to run an agent or do a task that matches an agent's role, read the agent's .md file and the property data, then use the Task tool with the agent's persona and instructions. Agents can use web search for market research and read local files for property context.

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch and open a PR.
- Branch naming: `feature/<short-description>` or `fix/<short-description>`

## Known Issues

- The Vercel production domain is still `vitamin-reminder.vercel.app` (legacy name). This is correct and working.
