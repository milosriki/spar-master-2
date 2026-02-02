// Elite PT AI Coach - Gamification Types

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  location: string; // DIFC, Marina, JBR, etc.
  fitnessGoal: string;
  subscriptionTier: 'free' | 'professional' | 'elite';
  joinedAt: Date;
  lastActivityAt: Date;
}

export interface GameState {
  // Core Stats
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  dailyXP: number;
  weeklyXP: number;
  
  // Habitica-inspired Health System
  currentHP: number;
  maxHP: number;
  
  // Habitica-inspired Currency System
  gold: number;
  gems: number;
  
  // Energy System
  currentEnergy: number;
  maxEnergy: number;
  lastEnergyRefill: Date;
  
  // Streak System
  currentStreak: number;
  bestStreak: number;
  streakMultiplier: number;
  streakFreezeCount: number; // Premium feature
  lastStreakActivity: Date;
  
  // Progress
  workoutsCompleted: number;
  challengesCompleted: number;
  achievementsUnlocked: string[];
  
  // Social
  rank: number;
  leaderboardPosition: number;
  friendsCount: number;
  
  // Character/Avatar System (Habitica-inspired)
  characterClass?: 'warrior' | 'mage' | 'healer' | 'rogue';
  equippedItems: EquippedItems;
  inventory: InventoryItem[];
  pets: Pet[];
  mounts: Mount[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: Date;
  category: 'streak' | 'workout' | 'energy' | 'social' | 'premium';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: 'energy' | 'workout' | 'streak' | 'social';
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  isPremium: boolean;
  expiresAt: Date;
  completedAt?: Date;
}

export interface MicroWin {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  xpReward: number;
  energyBoost: number;
  category: 'breathing' | 'movement' | 'hydration' | 'posture';
  instructions: string[];
}

export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  xpEarned?: number;
  microWin?: MicroWin;
  challenge?: Challenge;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  location: string;
  points: number;
  rank: number;
  streak: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface Notification {
  id: string;
  type: 'streak_reminder' | 'challenge_complete' | 'level_up' | 'energy_low' | 'social' | 'premium';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionType?: 'open_app' | 'start_workout' | 'view_challenge' | 'upgrade_premium';
  scheduledFor: Date;
  isRead: boolean;
}

export interface SubscriptionTier {
  id: 'free' | 'professional' | 'elite';
  name: string;
  priceAED: number;
  features: string[];
  gamificationBonus: {
    xpMultiplier: number;
    energyBonus: number;
    streakProtection: boolean;
    exclusiveFeatures: string[];
  };
}

export interface PaywallTrigger {
  id: string;
  type: 'feature_limit' | 'energy_depletion' | 'streak_risk' | 'social_pressure' | 'achievement_earned';
  condition: string;
  urgency: 'low' | 'medium' | 'high';
  offer: PersonalizedOffer;
}

export interface PersonalizedOffer {
  id: string;
  headline: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  features: string[];
  timeLimit?: number; // milliseconds
  socialProof: string;
  ctaText: string;
  urgencyText?: string;
}

export interface UserBehaviorData {
  sessionsToday: number;
  avgSessionLength: number;
  daysActive: number;
  challengesCompleted: number;
  socialInteractions: number;
  engagementScore: number;
  conversionFunnelStage: string;
  lastPaywallShown?: Date;
}

// Habitica-inspired Character & Equipment System

export interface EquippedItems {
  weapon?: string;
  armor?: string;
  head?: string;
  shield?: string;
  pet?: string;
  mount?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'head' | 'shield' | 'potion' | 'food' | 'quest';
  description: string;
  goldCost: number;
  gemCost?: number;
  stats?: {
    strength?: number;
    intelligence?: number;
    constitution?: number;
    perception?: number;
  };
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  color: string;
  icon: string;
  feedProgress: number;
  isMount: boolean;
}

export interface Mount {
  id: string;
  name: string;
  species: string;
  color: string;
  icon: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  goldCost: number;
  type: 'custom' | 'game';
  icon: string;
  createdAt: Date;
}

export interface TaskColor {
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  value: number;
  description: string;
}

export interface HabitStats {
  totalTasks: number;
  habitsCount: number;
  dailiesCount: number;
  todosCount: number;
  completedToday: number;
  missedToday: number;
  totalGoldEarned: number;
  totalXPEarned: number;
}