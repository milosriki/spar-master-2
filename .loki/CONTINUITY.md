# Loki Mode Continuity

## ⚠️ PROJECT IDENTITY MAP — DO NOT CROSS-CONTAMINATE ⚠️

### spar-master-2 (SPAR Fitness App)
| Service   | ID / URL |
|-----------|----------|
| **Local** | `/Users/milosvukovic/spar-master-2` |
| **Vercel** | `prj_rV2piNEyEv4c1ShdYQ7nF2ZaMNQn` → project name: `spar-master-2` |
| **Supabase** | `yfcicfmfvsbzepbjjhxc` → `https://yfcicfmfvsbzepbjjhxc.supabase.co` |
| **Supabase Dashboard** | `spark mastery` \| `ptd-elite-coach` (PRODUCTION) |
| **Edge Functions** | `ai-coach` (only one) |
| **Config** | `supabase/config.toml` → `project_id = "yfcicfmfvsbzepbjjhxc"` |

### client-vital-suite (CEO Dashboard) — DO NOT TOUCH FROM THIS REPO
| Service   | ID / URL |
|-----------|----------|
| **Local** | `/Users/milosvukovic/client-vital-suite` |
| **Vercel** | `prj_8ufqRnF5PCmzd7ep9HPvqPMQC2lA` → project name: `client-vital-suite` |
| **Supabase** | `ztjndilxurtsfqdsvfds` → `https://ztjndilxurtsfqdsvfds.supabase.co` |
| **Edge Functions** | `meta-capi`, `stripe-*`, `diagnostician`, etc. |
| **Config** | `supabase/config.toml` → `project_id = "ztjndilxurtsfqdsvfds"` |

### Vercel Org
Both projects belong to: `team_k2pQynzJNHrOBWbIDzK5NX4U`

### RULES
- **NEVER** run SQL migrations for spar-master-2 on `ztjndilxurtsfqdsvfds`
- **NEVER** deploy spar-master-2 Edge Functions to `ztjndilxurtsfqdsvfds`
- **ALWAYS** verify `project_id` in `supabase/config.toml` before any Supabase operation
- When in doubt: `yfcicfmfvsbzepbjjhxc` = SPAR, `ztjndilxurtsfqdsvfds` = Vital Suite

---

## Live Supabase State (yfcicfmfvsbzepbjjhxc) — Verified 2026-02-11T11:33 UTC

### Tables (public schema — 7 total)
| Table | Status | Source Migration |
|-------|--------|-----------------|
| `profiles` | ✅ Exists | `20260210_add_gamification_schema.sql` (extended original) |
| `spark_leads` | ✅ Exists | `20251011141504_*.sql` + `20260210b_add_missing_lead_columns.sql` |
| `chat_history` | ✅ Exists | `20260210_add_gamification_schema.sql` |
| `user_memories` | ✅ Exists | `003_user_memories.sql` (P1) |
| `habits` | ✅ Exists | `004_habits_inventory_metrics.sql` (P2) |
| `inventory` | ✅ Exists | `004_habits_inventory_metrics.sql` (P2) |
| `ai_metrics` | ✅ Exists | `004_habits_inventory_metrics.sql` (P2) |

### Edge Functions (1 total)
| Function | Status | Version |
|----------|--------|---------|
| `ai-coach` | ✅ ACTIVE | **v6** — P2 + Phase 7 (sales intelligence + booking nudges + paywall), deployed via CLI 2026-02-11 |

### Supabase CLI & MCP
| Tool | Status | Detail |
|------|--------|--------|
| **CLI** | ✅ Linked | `/opt/homebrew/bin/supabase` v2.75.0, linked to `yfcicfmfvsbzepbjjhxc` |
| **MCP** | ✅ Configured | `.cursor/mcp.json` → `supabase-spar-mastery` (project-isolated) |
| **Credentials** | ✅ Saved | `.env.supabase` (gitignored) |

### Local Migration Files (5 total — all idempotent)
1. `20251011141504_*.sql` — `spark_leads` table + `update_updated_at_column()` trigger
2. `20260210_add_gamification_schema.sql` — gamification columns + `chat_history`
3. `20260210b_add_missing_lead_columns.sql` — extra columns on `spark_leads`
4. `003_user_memories.sql` — P1 memory system
5. `004_habits_inventory_metrics.sql` — P2: `habits`, `inventory`, `ai_metrics`

### Client-Side Supabase Config
- `src/integrations/supabase/client.ts` — reads from `.env` vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- No `.env` file in repo — env vars set via Vercel Dashboard
- `.env.supabase` — local CLI credentials (gitignored)

---

## Current Task
Phase 10+ — Future phases (Onboarding, Push Notifications, Viral Growth). All core features shipped.

## Latest Git Commit
`10ff7d5` — `feat: Phase 7+8 — Sales intelligence, paywall, HP damage system` (57 files, +5754/-966)
Branch: `feat/ai-habit-coach` → `origin/feat/ai-habit-coach`

## Mistakes & Learnings
- **Mistake**: Refactored Challenge System without sufficient discovery.
- **Correction**: Deep discovery is mandatory.
- **Mistake (P1)**: Almost deployed to wrong Supabase project.
- **Correction**: Created identity map above. Always verify before deploying.
- **Fixed**: `habits`, `inventory`, `ai_metrics` tables now migrated to live DB via CLI.
- **Fixed**: All migrations made idempotent (safe to re-run via `supabase db push`).
- **Fixed**: Supabase CLI found at `/opt/homebrew/bin/supabase`, PATH was missing.
- **Learning (Phase 7C)**: Paywall cooldown pattern — 3-day dismiss cooldown prevents user fatigue without losing conversion opportunity.
- **Learning (Phase 8)**: HP death penalty (10% gold loss) creates loss-aversion urgency loop. Users complete habits to avoid losing gold — behavioral nudge stronger than positive rewards.
- **Learning (Loki Mode)**: Local SKILL.md at `~/.agent/skills/antigravity-awesome-skills/skills/loki-mode/SKILL.md` — always use this path.

## Completed Phases
- [x] P0: Multi-Turn Context + Dynamic Prompt
- [x] P1: Persistent Memory + Safety (deployed 2026-02-11)
- [x] P2: Anti-Repetition + Observability + Proactive (deployed via CLI 2026-02-11)
- [x] Supabase CLI linked + MCP configured (project-isolated)
- [x] Phase 6: Gamification Sync (Inventory/Habits/Gold + Real Leaderboard)
- [x] Phase 7A: Covert Booking Nudges (4 triggers + sales intelligence rules in Edge Function)
- [x] Phase 7B: Multi-Signal Booking Readiness Score (getBookingReadiness → 7 signals → 4 nudge types)
- [x] Phase 7C: AI Message Paywall (3/day free, PaywallModal, 3-day cooldown)
- [x] Phase 7D: Future Architecture Docs (HubSpot CRM + Typeform quiz)
- [x] Phase 8: HP Damage System + Booking Context Enrichment + Game State Helpers
- [x] Phase 9: Git commit + push (`10ff7d5` → origin/feat/ai-habit-coach)

