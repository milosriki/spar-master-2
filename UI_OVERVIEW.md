# Progress Roadmap Feature - UI Overview

## Visual Design

The Progress Roadmap feature introduces a comprehensive visual system for tracking user progression from beginner to professional level.

## Main Components

### 1. Navigation Tab
```
┌────────────────────────────────────────────────┐
│ Dashboard | Progress | AI Coach | Challenges │
│           |    ✓     |          |             │
└────────────────────────────────────────────────┘
```
A new "Progress" tab (with Map icon) is added to the main navigation between Dashboard and AI Coach.

### 2. Header Card

```
╔══════════════════════════════════════════════════════╗
║  🗺️ Your Progress Roadmap            [?] Guide  [Level 8] ║
║  Track your journey from beginner to professional    ║
║  graduate level                                      ║
║                                                      ║
║  Overall Progress                    3 / 7 milestones║
║  [████████░░░░░░░░░░░░░░░░░░░░] 43% Complete        ║
║                                                      ║
║  Category Progress:                                  ║
║  ┌─────────┬─────────┬─────────┬─────────┬─────────┐║
║  │Beginner │Intermed │Advanced │Profess. │  Elite  │║
║  │  2/2 ✓  │  1/2    │  0/1    │  0/1    │  0/1    │║
║  └─────────┴─────────┴─────────┴─────────┴─────────┘║
║                                                      ║
║  CURRENT MILESTONE          |  NEXT MILESTONE       ║
║  ┌───────────────────────┐  |  ┌──────────────────┐║
║  │ Building Momentum     │  |  │ Energy Discipline│║
║  │ Establish consistent  │  |  │ Master consistent│║
║  │ energy habits         │  |  │ energy mgmt      │║
║  │ [View Details]        │  |  │ Unlocks at Lvl 4 │║
║  └───────────────────────┘  |  └──────────────────┘║
╚══════════════════════════════════════════════════════╝
```

### 3. Learning Paths Selection

```
╔══════════════════════════════════════════════════════╗
║  🎯 Choose Your Path                                  ║
║  Select a learning path that matches your goals      ║
║                                                      ║
║  ┌─────────────┬─────────────┬─────────────┐       ║
║  │ [beginner]  │ [advanced]  │[intermediate]│       ║
║  │   90 days   │   60 days   │  120 days   │       ║
║  │             │             │             │       ║
║  │ Beginner to │ Fast Track  │ Executive   │       ║
║  │ Professional│ to Elite    │ Excellence  │       ║
║  │             │             │             │       ║
║  │ Complete    │ Accelerated │ Tailored for│       ║
║  │ progression │ path for    │ busy execs  │       ║
║  │ from day 1  │ high-achiev │ in Dubai    │       ║
║  │             │             │             │       ║
║  │ ⭐ Energy   │ ⭐ Peak     │ ⭐ Energy   │       ║
║  │ ⭐ Consist. │ ⭐ Leaders. │ ⭐ Work-Life│       ║
║  │ ⭐ Discipl. │ ⭐ Excell.  │ ⭐ Stress   │       ║
║  └─────────────┴─────────────┴─────────────┘       ║
╚══════════════════════════════════════════════════════╝
```

### 4. Milestone Cards

Each milestone is displayed as a detailed card:

```
╔════════════════════════════════════════════════╗
║ [Beginner] [Level 3] [✓ Completed]            ║
║                                                ║
║ Building Momentum                              ║
║ Establish consistent energy habits             ║
║                                                ║
║ 🎯 Requirements                                ║
║ ┌────────────────────────────────────────────┐║
║ │ 🏆 Reach Level 3                           │║
║ │ [████████████████████████████] 100%        │║
║ │                                            │║
║ │ 🔥 Build a 5-day streak                    │║
║ │ [███████████████░░░░░░░░░] 80%            │║
║ │                                            │║
║ │ 🎯 Complete 5 challenges                   │║
║ │ [████████████░░░░░░░░░░░░] 60%            │║
║ └────────────────────────────────────────────┘║
║                                                ║
║ 🏆 Rewards                                     ║
║ • +500 Bonus XP                                ║
║ • 1.2x XP Multiplier                           ║
║ • Momentum Builder Badge                       ║
║                                                ║
║          [Start This Milestone]                ║
╚════════════════════════════════════════════════╝
```

### 5. Category Color Coding

- **Beginner**: Green background with green text
- **Intermediate**: Blue background with blue text
- **Advanced**: Purple background with purple text
- **Professional**: Orange background with orange text
- **Elite**: Gold gradient background with white text

### 6. Progress Indicators

Visual elements throughout:
- Progress bars with percentage overlays
- Checkmark icons (✓) for completed items
- Lock icons (🔒) for locked milestones
- Category icons (Target, TrendingUp, Flame, Award, Crown)
- Requirement type icons (Trophy, Flame, Zap, Target)

### 7. Welcome Guide Dialog

First-time users see an interactive guide:

```
╔══════════════════════════════════════════════════╗
║  🏆 Welcome to Your Progress Roadmap!            ║
║                                                  ║
║  Track your journey from beginner to professional║
║  level with our comprehensive milestone system.  ║
║                                                  ║
║  🎯 Clear Milestones                             ║
║  7 progressive milestones from Beginner to Elite ║
║  Each milestone has specific requirements and    ║
║  rewards.                                        ║
║                                                  ║
║  📈 Learning Paths                               ║
║  Choose from 3 learning paths based on your      ║
║  goals: 60-day Fast Track, 90-day Beginner to    ║
║  Pro, or 120-day Executive Excellence.           ║
║                                                  ║
║  ✅ Track Progress                               ║
║  Visual progress bars show your advancement in   ║
║  XP, streaks, workouts, and challenges.          ║
║                                                  ║
║  ⚡ Earn Rewards                                  ║
║  Complete milestones to earn bonus XP, unlock    ║
║  premium features, gain XP multipliers, and      ║
║  collect exclusive badges. Reach Level 20 for    ║
║  the prestigious Pro Graduate badge!             ║
║                                                  ║
║  💡 Pro Tip: Focus on completing your current    ║
║     milestone first. Consistency is key!         ║
║                                                  ║
║              [Got it, Let's Start!]              ║
╚══════════════════════════════════════════════════╝
```

## Responsive Design

### Desktop View (> 768px)
- 6-column tab navigation
- 2-column grid for milestone cards
- 3-column grid for learning paths
- 5-column grid for category stats

### Mobile View (< 768px)
- Condensed tab navigation with icons only
- Single column for milestone cards
- Single column for learning paths
- 2-column grid for category stats

## Interactive Elements

### Buttons
- **"View Details"**: Opens milestone details
- **"Start This Milestone"**: Tracks user intent to work on milestone
- **"Guide"**: Reopens the welcome guide
- **Path Selection**: Clicking a path filters milestones

### Hover States
- Milestone cards highlight on hover
- Path selection cards show border on hover
- Buttons show hover effects

### Dynamic Updates
- Progress bars animate when updated
- Glow effect appears when close to level up (>85%)
- Checkmarks appear when requirements are completed
- Category badges show completion status

## Typography

- **Headers**: Large, bold text for section titles
- **Milestone Titles**: Extra large, prominent
- **Descriptions**: Regular, muted text
- **Stats**: Bold numbers with context labels
- **Badges**: Uppercase, bold, color-coded

## Color Palette

- Primary: Blue gradient
- Success: Green (#22c55e)
- Warning: Orange (#f97316)
- XP: Gold (#eab308)
- Energy: Blue (#3b82f6)
- Streak: Orange flame
- Background: Gradient from background to secondary

## Spacing

- Consistent 6-unit spacing between sections
- 4-unit padding in cards
- 3-unit gaps in grids
- 2-unit spacing for inline elements

## Accessibility Features

- Color-coded with text labels (not color-only)
- Progress bars include percentage text
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatible
- High contrast mode ready

## User Flow

1. User clicks "Progress" tab
2. (First time) Welcome guide appears
3. User sees overall progress overview
4. User can select a learning path
5. User views milestone cards with requirements
6. User tracks progress on each requirement
7. User completes milestones to earn rewards
8. User progresses toward "Pro Graduate" status

## Summary

The Progress Roadmap UI provides a comprehensive, visually appealing, and highly functional interface for tracking user progression. It combines clear information architecture, engaging visual design, and interactive elements to create a motivating experience that guides users from beginner to professional level.
