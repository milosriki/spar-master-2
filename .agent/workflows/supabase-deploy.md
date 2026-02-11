---
description: Deploy Supabase Edge Functions and SQL migrations for Spar Mastery
---

# Supabase Deployment Workflow

## Prerequisites
- Supabase CLI: `/opt/homebrew/bin/supabase` (v2.75.0)
- Project linked: `yfcicfmfvsbzepbjjhxc` (Spar Mastery)
- Credentials: `.env.supabase`

## Deploy Edge Function

// turbo
1. Verify project config:
```
cat supabase/config.toml | grep project_id
```
Expected: `project_id = "yfcicfmfvsbzepbjjhxc"`

2. Deploy the function:
```
/opt/homebrew/bin/supabase functions deploy ai-coach --no-verify-jwt --project-ref yfcicfmfvsbzepbjjhxc
```

// turbo
3. Verify deployment:
```
/opt/homebrew/bin/supabase functions list --project-ref yfcicfmfvsbzepbjjhxc
```

## Push SQL Migrations

1. Push all pending migrations:
```
/opt/homebrew/bin/supabase db push --linked --password unavukovic86 --include-all
```
Answer `Y` when prompted.

## Stream Logs

// turbo
1. View recent logs:
```
/opt/homebrew/bin/supabase functions logs ai-coach --project-ref yfcicfmfvsbzepbjjhxc
```

## Quick Test

// turbo
1. Test Edge Function is live:
```
curl -s -o /dev/null -w "%{http_code}" https://yfcicfmfvsbzepbjjhxc.supabase.co/functions/v1/ai-coach -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2ljZm1mdnNiemVwYmpqaHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk2OTMsImV4cCI6MjA4NjMxNTY5M30.gxKRwCumOfj75dRwBSqg_CcPySlqtgtToPi0vdatmY0"
```
Expected: `405` (Method Not Allowed = function is live, needs POST body)

## ⚠️ SAFETY RULES
- **ALWAYS** verify `project_id` before deploying — `yfcicfmfvsbzepbjjhxc` = SPAR, `ztjndilxurtsfqdsvfds` = Vital Suite
- **NEVER** deploy Spar Mastery functions to the Vital Suite project
- All migrations MUST be idempotent (use `IF NOT EXISTS`, `DROP POLICY IF EXISTS`)
