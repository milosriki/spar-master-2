# Project Context: Spark Mastery

## Overview
Spark Mastery is a gamified performance coaching application built with Vite, React, TypeScript, and Shadcn UI. It features a "Progress Roadmap" to guide users from beginner to elite levels.

## Tech Stack
- **Framework**: Vite + React + TypeScript
- **UI Components**: Shadcn UI (Radix Primitives) + Tailwind CSS
- **State Management**: React Query, Context API (likely `useGameState`)
- **Icons**: Lucide React
- **Visualization**: Recharts
- **Backend/Auth**: Supabase (implied by dependencies)

## Core Features
1. **Progress Roadmap**:
   - 7 Milestones (Beginner -> Elite)
   - 3 Learning Paths (Beginner, Fast Track, Executive)
   - Visual tracking of XP, streaks, workouts.
   - Reward system (Badges, Multipliers).
   - Status: **Completed & Production Ready**.

2. **AI Coach**:
   - Mentioned in UI Overview as a tab.
   - Status: **Unknown/To Be Assessing**.

3. **Dashboard**:
   - Main entry point.

4. **Challenges**:
   - Gamified tasks.

## Recent Changes
- Implementation of Progress Roadmap (Files: `src/components/progress/*`, `src/data/progressMilestones.ts`, `src/lib/progressUtils.ts`).

## Potential Next Steps (From Roadmap)
- AI Coach enhancements.
- Social features (Group challenges).
- Advanced Analytics.
- Custom Learning Paths.
