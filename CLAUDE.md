# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarelAssistant is a family personal assistant that sends scheduled Telegram notifications via a Vercel serverless function. It evolved from a simple vitamin reminder into a general-purpose family reminder service.

## Commands

- **Test locally**: `npm test` (runs `tsx test-notification.ts` — sends a test Telegram message)
- **Deploy**: Push to `main` triggers GitHub Actions deploy to Vercel production
- There is no build step locally; TypeScript compilation happens on Vercel during deployment.

## Architecture

Single serverless endpoint: `api/remind.ts` — a Vercel serverless function that accepts a message (via query param, POST body, or default) and sends it to Telegram via the Bot API.

**Trigger mechanisms (three parallel systems):**
1. **Vercel cron** (`vercel.json`) — daily at 17:00 UTC with default message
2. **GitHub Actions** (`morning-reminder.yml`, `solo-walk-reminder.yml`) — scheduled workflows that POST custom messages to the endpoint
3. **Manual** — `workflow_dispatch` on the GitHub Actions, or direct HTTP request

## Environment Variables

Required in Vercel and locally (in `.env.local`):
- `TELEGRAM_BOT_TOKEN` — from Telegram BotFather
- `TELEGRAM_CHAT_ID` — target chat/user ID

## Tech Stack

- TypeScript (ESM) on Node.js
- Vercel serverless functions (`@vercel/node`)
- `node-fetch` for HTTP requests
- GitHub Actions for CI/CD and additional cron triggers

## Known Issues

- GitHub Actions workflows still reference the old `vitamin-reminder.vercel.app` domain in their URLs.
