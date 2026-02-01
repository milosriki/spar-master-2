# Progress Roadmap Feature

## Overview

The Progress Roadmap is a comprehensive feature designed to help users track their journey from beginner to professional/elite level in the Spark Mastery fitness application. It provides clear milestones, requirements, and rewards to guide users through their transformation.

## Key Features

### 1. Progressive Milestones

Seven distinct milestones track user progression across five categories:

- **Beginner** (Levels 1-5): Energy Awakening, Building Momentum
- **Intermediate** (Levels 6-12): Energy Discipline, Consistency Champion
- **Advanced** (Levels 13-20): Energy Warrior
- **Professional** (Level 20): Professional Mastery - The "Pro Graduate" level
- **Elite** (Level 25+): Elite Legend

Each milestone includes:
- Level requirement
- Specific requirements (XP, streak, workouts, challenges, social)
- Rewards (XP bonuses, feature unlocks, badges, multipliers)
- Progress tracking with visual indicators

### 2. Learning Paths

Three distinct learning paths cater to different user goals:

#### Beginner to Professional (90 days)
- Target: Users starting from scratch
- Focus: Energy Management, Consistency, Discipline, Fitness, Mental Resilience
- Milestones: Beginner → Intermediate → Professional

#### Fast Track to Elite (60 days)
- Target: Ambitious high-achievers
- Focus: Peak Performance, Leadership, Excellence, Mastery, Elite Mindset
- Milestones: All levels including Elite
- Difficulty: Advanced

#### Executive Excellence (120 days)
- Target: Busy Dubai executives
- Focus: Energy Optimization, Work-Life Balance, Stress Management, Peak Performance
- Milestones: Customized for executive lifestyle
- Difficulty: Intermediate

### 3. Real-Time Progress Tracking

The system automatically tracks:
- Overall progress percentage
- Category-wise completion stats
- Current and next milestone preview
- Individual requirement progress with visual bars
- Achievement unlock status

### 4. Visual Feedback

- Color-coded categories (green→blue→purple→orange→gold)
- Progress bars for each requirement
- Category icons (Target, TrendingUp, Flame, Award, Crown)
- Unlock/complete badges
- Milestone cards with detailed information

## How to Use

### For Users

1. **Navigate to Progress Tab**: Click the "Progress" tab in the main navigation
2. **Choose a Path**: Select a learning path that matches your goals and timeline
3. **View Current Milestone**: See your current milestone and what's required to complete it
4. **Track Progress**: Monitor your progress on each requirement with visual bars
5. **Complete Milestones**: Earn rewards and unlock new features as you progress

### For Developers

#### Accessing the Progress Roadmap

```typescript
import { ProgressRoadmap } from '@/components/progress/ProgressRoadmap';
import { useGameState } from '@/hooks/useGameState';

function MyComponent() {
  const { gameState } = useGameState();
  
  return (
    <ProgressRoadmap 
      gameState={gameState}
      onStartMilestone={(milestoneId) => {
        // Handle milestone start
      }}
    />
  );
}
```

#### Utility Functions

```typescript
import {
  calculateRequirementProgress,
  calculateRequirementPercentage,
  isMilestoneUnlocked,
  isMilestoneCompleted,
  updateMilestoneWithGameState
} from '@/lib/progressUtils';

// Calculate current progress for a requirement
const progress = calculateRequirementProgress(requirement, gameState);

// Get percentage (0-100)
const percentage = calculateRequirementPercentage(current, target);

// Check if milestone is unlocked (unlocks 2 levels before)
const unlocked = isMilestoneUnlocked(milestoneLevel, currentLevel);

// Check if milestone is completed
const completed = isMilestoneCompleted(milestone, gameState);

// Update entire milestone with current game state
const updatedMilestone = updateMilestoneWithGameState(milestone, gameState);
```

#### Adding New Milestones

To add a new milestone, edit `src/data/progressMilestones.ts`:

```typescript
{
  id: 'unique-id',
  level: 30,
  title: 'New Milestone',
  description: 'Description here',
  category: 'elite',
  requirements: [
    { 
      id: 'req-id', 
      type: 'xp', 
      description: 'Reach Level 30', 
      target: 90000, 
      current: 0, 
      isCompleted: false 
    }
  ],
  rewards: [
    { 
      type: 'xp', 
      value: 50000, 
      description: '+50000 Bonus XP' 
    }
  ],
  isUnlocked: false,
  isCompleted: false,
  progressPercentage: 0
}
```

## Technical Architecture

### Components

- `ProgressRoadmap.tsx`: Main component showing overall progress and milestone grid
- `MilestoneCard.tsx`: Individual milestone card with requirements and rewards
- `progressUtils.ts`: Utility functions for progress calculations
- `progressMilestones.ts`: Data definitions for milestones and learning paths
- `progressRoadmap.ts`: TypeScript type definitions

### Data Flow

1. User's game state is passed to ProgressRoadmap
2. Each milestone is updated with current progress using `updateMilestoneWithGameState`
3. Requirements are calculated dynamically based on game state
4. Visual components render based on calculated progress
5. User interactions trigger callbacks to parent component

### Integration Points

- **Game State**: Reads XP, level, streak, workouts, challenges from useGameState hook
- **Navigation**: Integrated as a tab in main application navigation
- **Gamification System**: Connected to existing achievement and reward systems
- **UI Components**: Uses shadcn/ui components for consistent styling

## Milestone Requirements

### Requirement Types

- `xp`: Total experience points earned
- `streak`: Consecutive days of activity
- `workouts`: Total workouts completed
- `challenges`: Total challenges completed
- `energy`: Energy level maintenance over time
- `social`: Social interactions (friends, leaderboard position)

### Reward Types

- `xp`: Bonus experience points
- `multiplier`: XP earning multiplier (e.g., 1.5x, 2.0x)
- `feature`: Feature unlocks (e.g., "Advanced Analytics", "Premium AI Coach")
- `badge`: Achievement badges (e.g., "Pro Graduate", "Elite Legend")

## Benefits for Users

1. **Clear Goals**: Users always know what to work toward next
2. **Motivation**: Visual progress tracking encourages continued engagement
3. **Gamification**: Rewards and unlocks make the journey exciting
4. **Flexibility**: Multiple paths accommodate different goals and timelines
5. **Achievement**: Clear "Pro Graduate" milestone at Level 20 provides sense of accomplishment

## Future Enhancements

Potential improvements for future iterations:

1. **Custom Paths**: Allow users to create personalized learning paths
2. **Social Milestones**: Add group challenges and team milestones
3. **Time-Based Tracking**: Track estimated time to complete based on current pace
4. **Recommendations**: AI-powered suggestions for optimal progression
5. **Milestone Sharing**: Share milestone achievements on social media
6. **Streak Recovery**: Help users recover from broken streaks
7. **Progress Analytics**: Detailed charts and graphs of progression over time
8. **Milestone Notifications**: Push notifications for milestone completions

## Configuration

Key configuration constants in `progressUtils.ts`:

```typescript
export const MILESTONE_UNLOCK_LEVELS_BEFORE = 2;
```

This controls how many levels before the target level a milestone becomes unlocked (currently 2 levels before).

## Accessibility

The Progress Roadmap is designed with accessibility in mind:

- Color-coded categories with text labels (not color-only)
- Progress bars with percentage text
- Keyboard navigation support via shadcn/ui components
- Screen reader friendly with semantic HTML
- High contrast mode compatible

## Performance

- Memoized calculations prevent unnecessary re-renders
- Efficient filtering and mapping of milestone arrays
- Lazy loading potential for milestone cards
- Optimized progress calculations using utility functions

## Testing

Recommended test scenarios:

1. **Milestone Unlocking**: Test that milestones unlock at correct levels
2. **Progress Calculation**: Verify all requirement types calculate correctly
3. **Path Filtering**: Ensure learning path selection filters milestones properly
4. **Visual Updates**: Test that UI updates when game state changes
5. **Edge Cases**: Test behavior at level boundaries and milestone transitions

## Support

For questions or issues with the Progress Roadmap feature, please refer to:
- Type definitions: `src/types/progressRoadmap.ts`
- Utility functions: `src/lib/progressUtils.ts`
- Component documentation: This file
