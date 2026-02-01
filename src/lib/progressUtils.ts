// Utility functions for progress tracking

import { GameState } from '@/types/gamification';
import { ProgressMilestone, MilestoneRequirement } from '@/types/progressRoadmap';

// Configuration constants
export const MILESTONE_UNLOCK_LEVELS_BEFORE = 2; // Unlock milestones this many levels before target level

/**
 * Calculate the current progress value for a requirement based on game state
 */
export const calculateRequirementProgress = (
  requirement: MilestoneRequirement,
  gameState: GameState
): number => {
  switch (requirement.type) {
    case 'xp':
      return gameState.totalXP;
    case 'streak':
      return Math.max(gameState.currentStreak, gameState.bestStreak);
    case 'workouts':
      return gameState.workoutsCompleted;
    case 'challenges':
      return gameState.challengesCompleted;
    case 'energy':
      // For energy requirements, we'd need to track this separately
      // For now, return the requirement's current value
      return requirement.current;
    case 'social':
      // For social requirements like leaderboard position
      return requirement.current;
    default:
      return requirement.current;
  }
};

/**
 * Calculate progress percentage for a requirement (0-100)
 */
export const calculateRequirementPercentage = (
  current: number,
  target: number
): number => {
  return Math.min(100, (current / target) * 100);
};

/**
 * Check if a milestone is unlocked based on current level
 */
export const isMilestoneUnlocked = (
  milestoneLevel: number,
  currentLevel: number
): boolean => {
  return currentLevel >= milestoneLevel - MILESTONE_UNLOCK_LEVELS_BEFORE;
};

/**
 * Check if a milestone is completed based on requirements
 */
export const isMilestoneCompleted = (
  milestone: ProgressMilestone,
  gameState: GameState
): boolean => {
  return milestone.requirements.every(req => {
    const current = calculateRequirementProgress(req, gameState);
    return current >= req.target;
  });
};

/**
 * Update milestone with current game state
 */
export const updateMilestoneWithGameState = (
  milestone: ProgressMilestone,
  gameState: GameState
): ProgressMilestone => {
  const updatedRequirements = milestone.requirements.map(req => {
    const current = calculateRequirementProgress(req, gameState);
    return {
      ...req,
      current,
      isCompleted: current >= req.target
    };
  });

  const completedCount = updatedRequirements.filter(r => r.isCompleted).length;
  const progressPercentage = (completedCount / updatedRequirements.length) * 100;

  return {
    ...milestone,
    requirements: updatedRequirements,
    isUnlocked: isMilestoneUnlocked(milestone.level, gameState.level),
    isCompleted: isMilestoneCompleted(milestone, gameState),
    progressPercentage
  };
};
