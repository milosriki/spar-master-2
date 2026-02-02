import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageSquare, 
  Trophy, 
  Target, 
  Settings, 
  Zap,
  Crown,
  Menu,
  Sparkles,
  Map,
  Activity,
  ListChecks
} from 'lucide-react';

// Components
import { EnergyBar } from '@/components/gamification/EnergyBar';
import { XPProgress } from '@/components/gamification/XPProgress';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { AIChat } from '@/components/ai/AIChat';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EnhancedDashboardStats } from '@/components/dashboard/EnhancedDashboardStats';
import { CharacterStats } from '@/components/character/CharacterStats';
import { RewardsShop } from '@/components/character/RewardsShop';
import { ProgressRoadmap } from '@/components/progress/ProgressRoadmap';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { EnhancedHabitTracker } from '@/components/habits/EnhancedHabitTracker';
import { RecoveryDashboard } from '@/components/performance/RecoveryDashboard';
import { TrainingCalendar } from '@/components/performance/TrainingCalendar';
import { PerformanceAnalytics } from '@/components/performance/PerformanceAnalytics';

// Hooks
import { useGameState } from '@/hooks/useGameState';

// Types
import { AIMessage, Challenge, MicroWin } from '@/types/gamification';
import { sendMessageToGemini } from '@/lib/gemini';

// Mock data
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Energy Warrior',
    description: 'Maintain 8+ energy for 3 days',
    type: 'daily',
    category: 'energy',
    targetValue: 3,
    currentProgress: 0,
    xpReward: 500,
    isPremium: false,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Dubai Heat Beater',
    description: 'Complete 5 workouts before 7 AM',
    type: 'weekly',
    category: 'workout',
    targetValue: 5,
    currentProgress: 0,
    xpReward: 1000,
    isPremium: true,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Streak Master',
    description: 'Reach a 14-day streak',
    type: 'special',
    category: 'streak',
    targetValue: 14,
    currentProgress: 0,
    xpReward: 2000,
    isPremium: false,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  }
];

const CHALLENGE_STORAGE_KEY = 'sparkMasteryChallenges';
const ACCEPTED_STORAGE_KEY = 'sparkMasteryAcceptedChallenges';

const serializeChallenges = (challenges: Challenge[]) =>
  challenges.map(challenge => ({
    ...challenge,
    expiresAt: challenge.expiresAt.toISOString(),
    completedAt: challenge.completedAt ? challenge.completedAt.toISOString() : undefined
  }));

const deserializeChallenges = (stored: string | null): Challenge[] => {
  if (!stored) return DEFAULT_CHALLENGES;
  try {
    const parsed = JSON.parse(stored) as Challenge[];
    return parsed.map(challenge => ({
      ...challenge,
      expiresAt: new Date(challenge.expiresAt),
      completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
    }));
  } catch {
    return DEFAULT_CHALLENGES;
  }
};

const Index = () => {
  const { 
    gameState, 
    completeChallenge, 
    completeMicroWin, 
    isStreakAtRisk, 
    logWorkout, 
    logDailyCheckIn,
    addXP,
    updateHP,
    addGold,
    spendGold,
    addGems
  } = useGameState();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_CHALLENGES;
    }
    return deserializeChallenges(localStorage.getItem(CHALLENGE_STORAGE_KEY));
  });
  const [acceptedChallengeIds, setAcceptedChallengeIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['1'];
    }
    const stored = localStorage.getItem(ACCEPTED_STORAGE_KEY);
    if (!stored) {
      return ['1'];
    }
    try {
      return JSON.parse(stored) as string[];
    } catch {
      return ['1'];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(serializeChallenges(challenges)));
  }, [challenges]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(ACCEPTED_STORAGE_KEY, JSON.stringify(acceptedChallengeIds));
  }, [acceptedChallengeIds]);

  // Real AI response using Gemini
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const responseText = await sendMessageToGemini(message);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        xpEarned: 10, // Award some XP for interacting
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get response", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicroWinComplete = (microWin: MicroWin) => {
    completeMicroWin(microWin);
    incrementChallengeProgress('energy', 1);
  };

  const handleChallengeAccept = (challenge: Challenge) => {
    if (acceptedChallengeIds.includes(challenge.id)) {
      return;
    }
    setAcceptedChallengeIds(prev => [...prev, challenge.id]);
  };

  const handleChallengeComplete = (challenge: Challenge) => {
    completeChallenge(challenge);
    setChallenges(prev => prev.map(item => (
      item.id === challenge.id
        ? { ...item, completedAt: new Date() }
        : item
    )));
  };

  const incrementChallengeProgress = (category: Challenge['category'], amount: number) => {
    setChallenges(prev => prev.map(item => {
      if (!acceptedChallengeIds.includes(item.id)) {
        return item;
      }
      if (item.completedAt || item.category !== category) {
        return item;
      }
      return {
        ...item,
        currentProgress: Math.min(item.targetValue, item.currentProgress + amount)
      };
    }));
  };

  const handleWorkoutLogged = () => {
    logWorkout();
    incrementChallengeProgress('workout', 1);
  };

  const handleDailyCheckIn = () => {
    logDailyCheckIn();
    incrementChallengeProgress('streak', 1);
  };

  const handleStartMilestone = (milestoneId: string) => {
    console.log('Starting milestone:', milestoneId);
    // TODO: Implement milestone tracking
  };

  const hoursUntilStreakExpiry = () => {
    const now = new Date();
    const lastActivity = new Date(gameState.lastStreakActivity);
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSince);
  };

  const todaysChallenge = useMemo(() => {
    const accepted = challenges.find(challenge => acceptedChallengeIds.includes(challenge.id));
    return accepted ?? challenges[0];
  }, [acceptedChallengeIds, challenges]);

  const handleHabitComplete = (habitId: string, xp: number, gold: number = 0) => {
    console.log(`Habit ${habitId} completed! Earned ${xp} XP and ${gold} gold`);
    addXP(xp, 'habit_completed');
    if (gold > 0) {
      addGold(gold);
    }
    incrementChallengeProgress('workout', 1);
  };

  const handleHabitMissed = (habitId: string, hpDamage: number) => {
    console.log(`Habit ${habitId} missed! Lost ${hpDamage} HP`);
    updateHP(-hpDamage);
  };

  const handlePurchase = (item: any, cost: number, currency: 'gold' | 'gems') => {
    if (currency === 'gold' && gameState.gold >= cost) {
      spendGold(cost);
      console.log(`Purchased ${item.name} for ${cost} gold`);
      // TODO: Add item to inventory
    } else if (currency === 'gems' && gameState.gems >= cost) {
      // TODO: Implement gem spending
      console.log(`Purchased ${item.name} for ${cost} gems`);
    } else {
      console.log('Not enough currency!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Elite PT Coach</h1>
            <p className="text-muted-foreground">Transform your energy, transform your success</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/spark-mastery">
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Spark Mastery</span>
              </Button>
            </Link>
            <Badge className="bg-gradient-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Professional
            </Badge>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="gap-2">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Habits</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Coach</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <EnhancedDashboardStats 
              stats={{
                workoutsCompleted: gameState.workoutsCompleted,
                challengesCompleted: gameState.challengesCompleted,
                totalXP: gameState.totalXP,
                currentStreak: gameState.currentStreak
              }}
              habitStats={{
                totalTasks: 12,
                habitsCount: 5,
                dailiesCount: 4,
                todosCount: 3,
                completedToday: 7,
                missedToday: 2,
                totalGoldEarned: 45,
                totalXPEarned: 150
              }}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Gamification */}
              <div className="lg:col-span-2 space-y-6">
                {/* Character Stats */}
                <CharacterStats gameState={gameState} />
                
                {/* Energy and XP */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-primary" />
                        Energy Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnergyBar 
                        current={gameState.currentEnergy}
                        max={gameState.maxEnergy}
                      />
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="h-5 w-5 text-xp" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <XPProgress 
                        currentXP={gameState.totalXP}
                        level={gameState.level}
                        xpToNext={gameState.xpToNextLevel}
                        dailyXP={gameState.dailyXP}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Streak Counter */}
                <StreakCounter 
                  currentStreak={gameState.currentStreak}
                  bestStreak={gameState.bestStreak}
                  multiplier={gameState.streakMultiplier}
                  freezeCount={gameState.streakFreezeCount}
                  isAtRisk={isStreakAtRisk()}
                  hoursLeft={Math.ceil(hoursUntilStreakExpiry())}
                />
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-4">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-2" onClick={() => setSelectedTab('coach')}>
                      <MessageSquare className="h-4 w-4" />
                      Ask AI Coach
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleWorkoutLogged}>
                      <Zap className="h-4 w-4" />
                      Log Workout
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleDailyCheckIn}>
                      <Target className="h-4 w-4" />
                      Daily Check-In
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSelectedTab('challenges')}>
                      <Target className="h-4 w-4" />
                      View Challenges
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSelectedTab('leaderboard')}>
                      <Trophy className="h-4 w-4" />
                      Check Ranking
                    </Button>
                  </CardContent>
                </Card>

                {/* Today's Challenge Preview */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Today's Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysChallenge ? (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">{todaysChallenge.title}</div>
                        <div className="text-lg font-semibold text-foreground">{todaysChallenge.description}</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {todaysChallenge.currentProgress}/{todaysChallenge.targetValue}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-success transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (todaysChallenge.currentProgress / todaysChallenge.targetValue) * 100)}%`
                            }}
                          />
                        </div>
                        <Button size="sm" className="w-full" onClick={() => setSelectedTab('challenges')}>
                          Continue Challenge
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No active challenge yet. Visit Challenges to start one.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Progress Roadmap Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressRoadmap 
              gameState={gameState}
              onStartMilestone={handleStartMilestone}
            />
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            <EnhancedHabitTracker 
              onHabitComplete={handleHabitComplete} 
              onHabitMissed={handleHabitMissed}
            />
            
            {/* Rewards Shop */}
            <RewardsShop 
              gold={gameState.gold}
              gems={gameState.gems}
              onPurchase={handlePurchase}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <RecoveryDashboard />
            <TrainingCalendar />
            <PerformanceAnalytics />
          </TabsContent>

          {/* AI Coach Tab */}
          <TabsContent value="coach" className="h-[calc(100vh-200px)]">
            <AIChat 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onMicroWinComplete={handleMicroWinComplete}
              isLoading={isLoading}
              className="h-full"
            />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Active Challenges</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete challenges to earn XP and unlock new features
                </p>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  onAccept={handleChallengeAccept}
                  onComplete={handleChallengeComplete}
                  isAccepted={acceptedChallengeIds.includes(challenge.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard 
              entries={[]}
              currentUserId="8"
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings panel will include profile customization, notification preferences, 
                  and subscription management.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
