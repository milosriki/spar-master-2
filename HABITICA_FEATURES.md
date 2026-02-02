# Habitica-Inspired Features Documentation

## Overview

This document describes the Habitica-inspired gamification features integrated into the Spark Mastery fitness coaching application. These features transform habit tracking into an engaging RPG-style experience with accountability mechanics, reward systems, and visual progression.

## Core Features

### 1. Character System

The character system provides users with a visual representation of their progress and health.

#### Components
- **CharacterStats** (`src/components/character/CharacterStats.tsx`)
  - Displays Health Points (HP), Experience Points (XP), Gold, and Gems
  - Shows character level and class (Warrior, Mage, Healer, Rogue)
  - Visual progress bars for HP and XP
  - Color-coded health status (green > 60%, yellow > 30%, red < 30%)

#### Game State Properties
```typescript
interface GameState {
  // Health System
  currentHP: number;
  maxHP: number;
  
  // Currency System
  gold: number;
  gems: number;
  
  // Character
  characterClass?: 'warrior' | 'mage' | 'healer' | 'rogue';
  equippedItems: EquippedItems;
  inventory: InventoryItem[];
  pets: Pet[];
  mounts: Mount[];
}
```

### 2. Enhanced Habit Tracker

The Enhanced Habit Tracker (`src/components/habits/EnhancedHabitTracker.tsx`) adds Habitica's core mechanics to habit management.

#### Key Features

**Color-Coded Tasks**
- Tasks change color based on performance value
- Red (-10+): Poor performance
- Orange (-1 to -10): Below average
- Yellow (-1 to 1): Neutral
- Green (1 to 5): Good performance
- Blue (5 to 10): Great performance
- Purple (10+): Excellent performance

**Reward System**
- Earn XP and Gold for completing tasks
- Gold reward = XP × 0.5 (configurable via `GOLD_TO_XP_RATIO`)
- Different rewards based on task difficulty

**Accountability System**
- Miss daily tasks to lose HP
- Default HP damage = 5 (configurable via `DEFAULT_DAILY_HP_DAMAGE`)
- Visual HP damage indicators on task cards
- Negative habits also cause HP damage

**Habit Types**
1. **Habits**: Ongoing behaviors tracked with positive/negative buttons
2. **Dailies**: Recurring tasks with streak tracking and HP penalties
3. **To-Dos**: One-time tasks with optional checklists and due dates

#### Usage Example

```tsx
import { EnhancedHabitTracker } from '@/components/habits/EnhancedHabitTracker';

function MyPage() {
  const handleHabitComplete = (habitId: string, xp: number, gold: number) => {
    // Award XP and gold to player
    addXP(xp);
    addGold(gold);
  };

  const handleHabitMissed = (habitId: string, hpDamage: number) => {
    // Apply HP damage for missed task
    updateHP(-hpDamage);
  };

  return (
    <EnhancedHabitTracker
      onHabitComplete={handleHabitComplete}
      onHabitMissed={handleHabitMissed}
    />
  );
}
```

### 3. Rewards Shop

The Rewards Shop (`src/components/character/RewardsShop.tsx`) allows users to spend earned gold on rewards.

#### Features

**Equipment Items**
- Weapons, Armor, Shields, Headgear
- Rarity levels: Common, Uncommon, Rare, Epic, Legendary
- Stat bonuses (Strength, Intelligence, Constitution, Perception)
- Dual currency support (Gold and Gems)
- Visual rarity indicators with color gradients

**Custom Rewards**
- User-defined real-life rewards
- Examples: Coffee Break (50g), Movie Night (200g), Spa Day (500g)
- Encourages positive reinforcement

**Pets & Mounts** (Coming Soon)
- Collection system for companion creatures
- Feed pets to grow them into mounts

#### Usage Example

```tsx
import { RewardsShop } from '@/components/character/RewardsShop';

function MyPage() {
  const { gameState, spendGold } = useGameState();

  const handlePurchase = (item: any, cost: number, currency: 'gold' | 'gems') => {
    if (currency === 'gold' && gameState.gold >= cost) {
      spendGold(cost);
      // Add item to inventory
    }
  };

  return (
    <RewardsShop
      gold={gameState.gold}
      gems={gameState.gems}
      onPurchase={handlePurchase}
    />
  );
}
```

### 4. Enhanced Dashboard Stats

The Enhanced Dashboard Stats (`src/components/dashboard/EnhancedDashboardStats.tsx`) provides comprehensive habit performance metrics.

#### Metrics Displayed

**Main Stats**
- Total Workouts Completed
- Total Challenges Completed
- Total XP Earned
- Current Streak Days

**Today's Habit Performance**
- Total Tasks
- Completed Tasks (green)
- Missed Tasks (red)
- Gold Earned (yellow)

**Task Breakdown**
- Habits Count
- Dailies Count
- To-Dos Count

**Completion Rate**
- Visual progress bar
- Percentage calculation
- Color-coded (green gradient)

## Game Mechanics

### Health Points (HP) System

**Purpose**: Provides accountability through tangible consequences

**Mechanics**:
- Start with 50 HP (maxHP)
- Lose HP by missing daily tasks or performing negative habits
- When HP reaches 0:
  - HP is restored to maximum
  - Lose 50% of gold
  - Drop one level (minimum level 1)
  - Character "faints" but continues playing

**Implementation**:
```typescript
const updateHP = useCallback((amount: number) => {
  setGameState(prev => {
    const newHP = Math.max(0, Math.min(prev.maxHP, prev.currentHP + amount));
    if (newHP === 0) {
      // Apply penalties
      return {
        ...prev,
        currentHP: prev.maxHP,
        gold: Math.floor(prev.gold * 0.5),
        level: Math.max(1, prev.level - 1)
      };
    }
    return { ...prev, currentHP: newHP };
  });
}, []);
```

### Currency System

**Gold**
- Primary currency earned through task completion
- Used to purchase equipment and custom rewards
- Can be lost when HP reaches 0
- Earned at 50% of XP value by default

**Gems**
- Premium currency (future implementation)
- Used for special items and features
- Not lost on HP depletion

### Task Value & Color System

**Task Value Calculation**:
- Each task has an internal value that increases/decreases with performance
- Positive completions: +1 value
- Negative actions: -1 value
- Value determines task color

**Color Meaning**:
- **Red**: Task is hurting you (negative value)
- **Orange**: Task needs attention
- **Yellow**: Neutral, starting point
- **Green**: Task is helping you
- **Blue**: Task is a strong positive habit
- **Purple**: Task is an excellent habit

## Configuration Constants

### EnhancedHabitTracker Constants

```typescript
// Gold earned per XP (0.5 = 50% of XP)
const GOLD_TO_XP_RATIO = 0.5;

// HP damage for missed daily tasks
const DEFAULT_DAILY_HP_DAMAGE = 5;
```

### Difficulty Multipliers

```typescript
export const DIFFICULTY_MULTIPLIERS: Record<HabitDifficulty, number> = {
  trivial: 0.5,
  easy: 1,
  medium: 1.5,
  hard: 2
};
```

### Base XP Values

```typescript
export const BASE_XP_VALUES: Record<HabitType, number> = {
  habit: 10,
  daily: 20,
  todo: 15
};
```

## Integration Guide

### Step 1: Import Components

```tsx
import { CharacterStats } from '@/components/character/CharacterStats';
import { EnhancedHabitTracker } from '@/components/habits/EnhancedHabitTracker';
import { RewardsShop } from '@/components/character/RewardsShop';
import { EnhancedDashboardStats } from '@/components/dashboard/EnhancedDashboardStats';
```

### Step 2: Use Game State Hook

```tsx
const { 
  gameState, 
  addXP, 
  updateHP, 
  addGold, 
  spendGold, 
  addGems 
} = useGameState();
```

### Step 3: Implement Handler Functions

```tsx
const handleHabitComplete = (habitId: string, xp: number, gold: number) => {
  addXP(xp, 'habit_completed');
  addGold(gold);
};

const handleHabitMissed = (habitId: string, hpDamage: number) => {
  updateHP(-hpDamage);
};

const handlePurchase = (item: any, cost: number, currency: 'gold' | 'gems') => {
  if (currency === 'gold' && gameState.gold >= cost) {
    spendGold(cost);
    // Add item to inventory
  }
};
```

### Step 4: Render Components

```tsx
return (
  <div>
    <EnhancedDashboardStats stats={...} habitStats={...} />
    <CharacterStats gameState={gameState} />
    <EnhancedHabitTracker 
      onHabitComplete={handleHabitComplete}
      onHabitMissed={handleHabitMissed}
    />
    <RewardsShop 
      gold={gameState.gold}
      gems={gameState.gems}
      onPurchase={handlePurchase}
    />
  </div>
);
```

## User Benefits

### Motivation & Engagement
- Visual feedback through character progression
- Tangible rewards (gold, equipment, custom rewards)
- RPG-style advancement system

### Accountability
- HP system provides real consequences
- Color-coded tasks show performance trends
- Streak tracking encourages consistency

### Positive Reinforcement
- Earn gold to purchase real-life rewards
- Equipment provides sense of progression
- Achievement unlocks boost motivation

### Clear Goals
- Task colors show what needs attention
- Progress bars provide immediate feedback
- Completion rates track overall performance

## Future Enhancements

### Planned Features
1. **Equipment System**: Equip items to boost stats
2. **Pets & Mounts**: Collect and feed companion creatures
3. **Quest System**: Group challenges with friends
4. **Party System**: Social accountability features
5. **Achievement Badges**: Unlock special achievements
6. **Task History**: Detailed analytics and graphs
7. **Streak Recovery**: Use gems to recover lost streaks
8. **Character Customization**: Avatar appearance options

### Technical Improvements
1. Backend persistence with Supabase
2. Real-time synchronization
3. Push notifications for streaks at risk
4. Mobile app integration
5. Social features (leaderboards, challenges)

## Troubleshooting

### Common Issues

**Q: HP keeps dropping to zero**
- A: Make sure to complete your daily tasks before the day resets
- A: Consider reducing difficulty of daily tasks
- A: Use streak freezes (premium feature)

**Q: Not earning enough gold**
- A: Complete more tasks
- A: Increase task difficulty for higher rewards
- A: Maintain streaks for XP multipliers (which boost gold)

**Q: Can't afford rewards**
- A: Focus on completing habits and dailies consistently
- A: Set realistic reward prices
- A: Build up gold before purchasing expensive items

## References

- Habitica Official Site: https://habitica.com
- Habitica Wiki: https://habitica.fandom.com/wiki/Habitica_Wiki
- Original Repository: https://github.com/HabitRPG/habitica

## License

This implementation is part of the Spark Mastery project and follows the repository's license. Habitica-inspired mechanics are used for educational and motivational purposes within this private fitness coaching application.
