import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  CheckSquare,
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
import { EnhancedHabitTracker } from '@/components/habits/EnhancedHabitTracker';
import { ProgressRoadmap } from '@/components/progress/ProgressRoadmap';

// Animation & Effects
import AnimatedLayout, { AnimatedItem } from '@/components/ui/AnimatedLayout';
import ParticleExplosion from '@/components/effects/ParticleExplosion';
import FloatingReward, { useFloatingRewards } from '@/components/effects/FloatingReward';
import HeroScene3D from '@/components/3d/HeroScene3D';

// Hooks
import { useGameState } from '@/hooks/useGameState';

// Types
import { AIMessage, Challenge, MicroWin, InventoryItem, Reward, LeaderboardEntry } from '@/types/gamification';
import { Habit, HabitStats } from '@/types/habits';
import { sendMessageToGemini, buildTimeContext, buildConversationHistory, getAIMessageCount, getMaxFreeMessages } from '@/lib/gemini';
import { PaywallModal } from '@/components/PaywallModal';

// Mock data
import { ChallengeService } from '@/services/challengeService';
import { LeaderboardService } from '@/services/leaderboardService';
import { LeadCaptureForm } from '@/components/booking/LeadCaptureForm';
import { AICoachService, AIHabitPlan } from '@/services/AICoachService';

const Index = () => {
  const { 
    gameState, 
    addXP,
    updateHP,
    addGold,
    purchaseItem,
    acceptChallenge,
    updateChallengeProgress,
    completeChallenge, 
    completeMicroWin, 
    isStreakAtRisk, 
    logWorkout, 
    logDailyCheckIn,
    HABIT_COMPLETE_GOLD,
  } = useGameState();

  // Particle & Floating Reward state
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleType, setParticleType] = useState<'xp' | 'gold' | 'streak' | 'level-up' | 'complete'>('xp');
  const { rewards, spawnReward, removeReward } = useFloatingRewards();

  // Habit stats tracking
  const [habitStats, setHabitStats] = useState<HabitStats>({
    habitsCompletedToday: 0,
    dailiesCompletedToday: 0,
    todosCompletedToday: 0,
    totalHabits: 2,
    totalDailies: 3,
    totalTodos: 2,
    goldEarnedToday: 0,
    xpEarnedToday: 0,
    missedDailies: 0,
  });
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  // Load Leaderboard Data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await LeaderboardService.getLeaderboardWithUser({
        name: 'You',
        points: gameState.totalXP,
        level: gameState.level,
        streak: gameState.currentStreak,
        location: 'Business Bay',
        avatar: '👤'
      });
      setLeaderboardEntries(data);
    };
    fetchLeaderboard();
  }, [gameState.totalXP, gameState.level, gameState.currentStreak]);


  // Real AI response using Gemini — with multi-turn context, habits, and time awareness
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Build context for intelligent responses
      const allMessages = [...chatMessages, userMessage];
      const conversationHistory = buildConversationHistory(allMessages);
      const timeContext = buildTimeContext();
      const todaysHabits = aiHabits?.map(h => ({
        title: h.title,
        completed: h.isCompleteToday,
      }));

      const responseText = await sendMessageToGemini(
        message,
        gameState,
        gameState.activeChallenges,
        conversationHistory,
        todaysHabits,
        timeContext,
      );
      // Check for paywall signal
      if (responseText === '__PAYWALL__') {
        setShowPaywall(true);
        // Remove the user message we just added since there's no AI response
        setChatMessages(prev => prev.filter(m => m.id !== userMessage.id));
        return;
      }

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        xpEarned: 10,
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
    updateChallengeProgress('energy', 1);
  };

  const handleChallengeAccept = (challenge: Challenge) => {
    acceptChallenge(challenge.id);
  };

  const handleChallengeComplete = (challenge: Challenge) => {
    completeChallenge(challenge);
    // Fire level-up particles
    setParticleType('level-up');
    setParticleTrigger(prev => prev + 1);
  };

  const handleWorkoutLogged = () => {
    logWorkout();
    updateChallengeProgress('workout', 1);
    spawnReward('+50 XP', 'xp', 200, 300);
    setParticleType('xp');
    setParticleTrigger(prev => prev + 1);
  };

  const handleDailyCheckIn = () => {
    logDailyCheckIn();
    updateChallengeProgress('streak', 1);
    spawnReward('+1 Streak', 'streak', 200, 300);
  };

  const handleStartMilestone = (milestoneId: string) => {
    console.log('Starting milestone:', milestoneId);
  };

  // Habit handlers with particle effects
  const handleHabitComplete = useCallback((habit: Habit) => {
    addXP(habit.xpReward, 'habit_complete');
    addGold(habit.goldReward);
    
    // Spawn floating rewards
    spawnReward(`+${habit.xpReward} XP`, 'xp', 150 + Math.random() * 100, 200 + Math.random() * 100);
    spawnReward(`+${habit.goldReward} Gold`, 'gold', 250 + Math.random() * 100, 200 + Math.random() * 100);

    // Fire particles
    setParticleType('complete');
    setParticleTrigger(prev => prev + 1);

    setHabitStats(prev => {
      const key = habit.type === 'habit' ? 'habitsCompletedToday'
        : habit.type === 'daily' ? 'dailiesCompletedToday'
        : 'todosCompletedToday';
      return {
        ...prev,
        [key]: prev[key] + 1,
        goldEarnedToday: prev.goldEarnedToday + habit.goldReward,
        xpEarnedToday: prev.xpEarnedToday + habit.xpReward,
      };
    });
  }, [addXP, addGold, spawnReward]);

  const handleHabitMissed = useCallback((habit: Habit) => {
    if (habit.hpDamage > 0) {
      updateHP(-habit.hpDamage);
      spawnReward(`-${habit.hpDamage} HP`, 'hp', 200, 150);
    }
    setHabitStats(prev => ({
      ...prev,
      missedDailies: prev.missedDailies + 1,
    }));
  }, [updateHP, spawnReward]);

  const handlePurchase = async (item: InventoryItem | Reward): Promise<boolean> => {
    if ('rarity' in item) {
      const success = await purchaseItem(item as InventoryItem);
      if (success) {
        setParticleType('gold');
        setParticleTrigger(prev => prev + 1);
      }
      return success;
    }
    const reward = item as Reward;
    if (reward.currency === 'gold') {
      return gameState.gold >= reward.cost;
    }
    return false;
  };

  const hoursUntilStreakExpiry = () => {
    const now = new Date();
    const lastActivity = new Date(gameState.lastStreakActivity);
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSince);
  };

  const todaysChallenge = useMemo(() => {
    const accepted = gameState.activeChallenges?.find(challenge => gameState.acceptedChallengeIds?.includes(challenge.id));
    return accepted ?? gameState.activeChallenges?.[0];
  }, [gameState.acceptedChallengeIds, gameState.activeChallenges]);

  const handleHabitsChange = (newHabits: Habit[]) => {
    if (aiHabits) {
      setAiHabits(newHabits);
      localStorage.setItem('spark_ai_habits', JSON.stringify(newHabits));
    }
  };

  // Onboarding State
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('spark_onboarded') === 'true';
  });

  const [aiHabits, setAiHabits] = useState<Habit[] | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const stored = localStorage.getItem('spark_ai_habits');
    return stored ? JSON.parse(stored) : undefined;
  });

  const handleOnboardingSuccess = (leadId: string, plan?: AIHabitPlan) => {
    setHasOnboarded(true);
    localStorage.setItem('spark_onboarded', 'true');
    
    if (plan) {
      // Convert AI plan to Habit objects
      const newHabits: Habit[] = [
        ...plan.daily.map((h, i) => ({
          id: `daily-${i}-${Date.now()}`,
          title: h.title,
          notes: h.notes,
          type: 'daily' as const,
          xpReward: h.xp,
          goldReward: Math.floor(h.xp / 2),
          taskColor: 'neutral' as const,
          taskValue: 0,
          hpDamage: 5,
          isCompleteToday: false,
          streak: 0,
          completionHistory: [],
          createdAt: new Date().toISOString(),
          frequency: 'daily' as const,
        })),
        ...plan.habits.map((h, i) => ({
          id: `habit-${i}-${Date.now()}`,
          title: h.title,
          notes: h.notes,
          type: 'habit' as const,
          xpReward: h.xp,
          goldReward: Math.floor(h.xp / 2),
          taskColor: 'neutral' as const,
          taskValue: 0,
          hpDamage: 0,
          isCompleteToday: false,
          streak: 0,
          completionHistory: [],
          createdAt: new Date().toISOString(),
        })),
        ...plan.todos.map((h, i) => ({
          id: `todo-${i}-${Date.now()}`,
          title: h.title,
          notes: h.notes,
          type: 'todo' as const,
          xpReward: h.xp,
          goldReward: Math.floor(h.xp / 2),
          taskColor: 'neutral' as const,
          taskValue: 0,
          hpDamage: 0,
          isCompleteToday: false,
          streak: 0,
          completionHistory: [],
          createdAt: new Date().toISOString(),
        })),
      ];
      
      setAiHabits(newHabits);
      localStorage.setItem('spark_ai_habits', JSON.stringify(newHabits));
      
      // Add welcome message to chat
      if (plan.coachMessage) {
        setChatMessages(prev => [{
          id: 'welcome',
          text: plan.coachMessage,
          sender: 'ai',
          timestamp: new Date(),
          xpEarned: 0
        }, ...prev]);
      }
    }
  };

  // Smart Booking Trigger — Multi-Signal Scoring
  useEffect(() => {
    const habitsCompleted = (aiHabits || []).filter(h => h.completed).length;
    const readiness = AICoachService.getBookingReadiness(
      gameState.level,
      gameState.currentStreak,
      chatMessages.length,
      habitsCompleted,
      gameState.workoutsCompleted || 0,
      gameState.gold,
      1, // session count (future: track from localStorage)
    );

    if (readiness.ready && readiness.nudgeType !== 'none') {
      const hasInvite = chatMessages.some(m => m.id === 'booking-invite');
      if (!hasInvite) {
        // Different messages based on nudge intensity
        const nudgeMessages: Record<string, string> = {
          soft: "💡 Quick thought — you're building some serious momentum. When you're ready to take things to the next level, I know some great trainers in Dubai who work with high-performers like you. No rush, just planting the seed. 🌱",
          medium: `🔥 Real talk — ${readiness.reason}. You're in the top tier of users on this app. Most people at your level see their best results when they combine this digital coaching with a PT who can push them in person. Want me to check available slots?`,
          direct: `⚡ ${readiness.reason}. I'm going to be straight with you — you've outgrown what an app alone can do. The data doesn't lie: your consistency puts you in the top 1%. I've seen athletes at your stage unlock breakthrough results with 1:1 personal training. I can check availability for a free strategy call this week — what do you say?`,
        };

        setChatMessages(prev => [{
          id: 'booking-invite',
          text: nudgeMessages[readiness.nudgeType] || nudgeMessages.soft,
          sender: 'ai',
          timestamp: new Date(),
          xpEarned: 0
        }, ...prev]);
      }
    }
  }, [gameState.level, gameState.currentStreak, chatMessages.length, aiHabits]);

  if (!hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <HeroScene3D />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0" />
        
        <Card className="w-full max-w-md z-10 glass-card border-primary/20 shadow-2xl animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
            </div>
            <CardTitle className="text-2xl font-heading font-bold gradient-text">
              Welcome to Spark Mastery
            </CardTitle>
            <p className="text-muted-foreground">
              Let's build your custom habit plan using AI.
            </p>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm onSuccess={handleOnboardingSuccess} />
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <HeroScene3D />

      {/* Particle Effects Overlay */}
      <ParticleExplosion
        trigger={particleTrigger}
        type={particleType}
        originX={0.5}
        originY={0.4}
      />

      {/* Floating Rewards Overlay */}
      <FloatingReward rewards={rewards} onComplete={removeReward} />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                <span className="gradient-text">Spark Mastery</span>
              </h1>
              <p className="text-muted-foreground text-sm">Transform your energy, transform your success</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/spark-mastery">
                <Button variant="outline" className="btn-ghost-glass gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Spark Mastery</span>
                </Button>
              </Link>
              <Badge className="btn-premium text-primary-foreground px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Professional
              </Badge>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs — Glass style */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="glass grid w-full grid-cols-7 p-1">
              <TabsTrigger value="dashboard" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="habits" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Habits</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="coach" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">AI Coach</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 cursor-pointer data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors duration-200">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <AnimatedLayout id="dashboard">
                {/* Enhanced Stats */}
                <AnimatedItem className="mb-6">
                  <EnhancedDashboardStats
                    gameState={gameState}
                    habitStats={habitStats}
                  />
                </AnimatedItem>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <AnimatedItem>
                      <CharacterStats gameState={gameState} />
                    </AnimatedItem>
                    <AnimatedItem>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="glass-card border-0">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-heading">
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

                        <Card className="glass-card border-0">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-heading">
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
                    </AnimatedItem>

                    <AnimatedItem>
                      <StreakCounter 
                        currentStreak={gameState.currentStreak}
                        bestStreak={gameState.bestStreak}
                        multiplier={gameState.streakMultiplier}
                        freezeCount={gameState.streakFreezeCount}
                        isAtRisk={isStreakAtRisk()}
                        hoursLeft={Math.ceil(hoursUntilStreakExpiry())}
                      />
                    </AnimatedItem>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <AnimatedItem>
                      <Card className="glass-card border-0">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full justify-start gap-2 btn-premium rounded-lg cursor-pointer" onClick={() => setSelectedTab('coach')}>
                            <MessageSquare className="h-4 w-4" />
                            Ask AI Coach
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 btn-ghost-glass rounded-lg cursor-pointer" onClick={handleWorkoutLogged}>
                            <Zap className="h-4 w-4" />
                            Log Workout
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 btn-ghost-glass rounded-lg cursor-pointer" onClick={handleDailyCheckIn}>
                            <Target className="h-4 w-4" />
                            Daily Check-In
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 btn-ghost-glass rounded-lg cursor-pointer" onClick={() => setSelectedTab('challenges')}>
                            <Target className="h-4 w-4" />
                            View Challenges
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 btn-ghost-glass rounded-lg cursor-pointer" onClick={() => setSelectedTab('leaderboard')}>
                            <Trophy className="h-4 w-4" />
                            Check Ranking
                          </Button>
                        </CardContent>
                      </Card>
                    </AnimatedItem>

                    <AnimatedItem>
                      <Card className="glass-card border-0">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-heading">Today's Challenge</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {todaysChallenge ? (
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground">{todaysChallenge.title}</div>
                              <div className="text-lg font-semibold text-foreground">{todaysChallenge.description}</div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium text-foreground tabular-nums">
                                  {todaysChallenge.currentProgress}/{todaysChallenge.targetValue}
                                </span>
                              </div>
                              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-success rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min(100, (todaysChallenge.currentProgress / todaysChallenge.targetValue) * 100)}%`
                                  }}
                                />
                              </div>
                              <Button size="sm" className="w-full btn-premium rounded-lg cursor-pointer" onClick={() => setSelectedTab('challenges')}>
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
                    </AnimatedItem>
                  </div>
                </div>
              </AnimatedLayout>
            </TabsContent>

            {/* Habits Tab */}
            <TabsContent value="habits" className="space-y-6">
              <AnimatedLayout id="habits">
                <div className="grid lg:grid-cols-3 gap-6">
                  <AnimatedItem className="lg:col-span-2">
                    <EnhancedHabitTracker
                      onHabitComplete={handleHabitComplete}
                      onHabitMissed={handleHabitMissed}
                      initialHabits={aiHabits}
                      onHabitsChange={handleHabitsChange}
                    />
                  </AnimatedItem>
                  <div className="space-y-6">
                    <AnimatedItem>
                      <CharacterStats gameState={gameState} />
                    </AnimatedItem>
                    <AnimatedItem>
                      <RewardsShop
                        gold={gameState.gold}
                        gems={gameState.gems}
                        onPurchase={handlePurchase}
                      />
                    </AnimatedItem>
                  </div>
                </div>
              </AnimatedLayout>
            </TabsContent>

            {/* Progress Roadmap Tab */}
            <TabsContent value="progress" className="space-y-6">
              <AnimatedLayout id="progress">
                <AnimatedItem>
                  <ProgressRoadmap 
                    gameState={gameState}
                    onStartMilestone={handleStartMilestone}
                  />
                </AnimatedItem>
              </AnimatedLayout>
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
              <AnimatedLayout id="challenges">
                <AnimatedItem className="mb-6">
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="font-heading">Active Challenges</CardTitle>
                    </CardHeader>
                  </Card>
                </AnimatedItem>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameState.activeChallenges && gameState.activeChallenges.map((challenge, index) => (
                    <AnimatedItem key={challenge.id}>
                      <ChallengeCard 
                        challenge={challenge}
                        isAccepted={gameState.acceptedChallengeIds.includes(challenge.id)}
                        onAccept={handleChallengeAccept}
                        onComplete={handleChallengeComplete}
                      />
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedLayout>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <AnimatedLayout id="leaderboard">
                <AnimatedItem>
                  <Leaderboard 
                    entries={leaderboardEntries}
                    currentUserId="current-user"
                  />
                </AnimatedItem>
              </AnimatedLayout>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <AnimatedLayout id="settings">
                <AnimatedItem>
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="font-heading">Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Settings panel will include profile customization, notification preferences, 
                        and subscription management.
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              </AnimatedLayout>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        messagesUsed={getAIMessageCount()}
        maxFreeMessages={getMaxFreeMessages()}
      />
    </div>
  );
};

export default Index;
