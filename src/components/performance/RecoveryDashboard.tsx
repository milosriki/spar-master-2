import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Moon, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Brain,
  Droplet
} from 'lucide-react';
import type { RecoveryMetrics, DailyRecommendation } from '@/types/performance';

interface RecoveryDashboardProps {
  metrics?: RecoveryMetrics;
  recommendation?: DailyRecommendation;
}

export function RecoveryDashboard({ 
  metrics = {
    id: '1',
    userId: 'user1',
    date: new Date(),
    hrv: 65,
    hrvScore: 78,
    sleepDuration: 7.5,
    sleepQuality: 82,
    deepSleepPercentage: 22,
    remSleepPercentage: 25,
    recoveryScore: 80,
    readinessScore: 75,
    energyLevel: 7,
    stressLevel: 4,
    musclesoreness: 3,
    mood: 8,
  },
  recommendation = {
    date: new Date(),
    recoveryScore: 80,
    readinessScore: 75,
    recommendedIntensity: 'moderate',
    reasoning: 'Your recovery metrics are good. HRV is slightly elevated and sleep quality was solid.',
    trainingTips: [
      'Focus on technique during your workout',
      'Keep intensity moderate to avoid overtraining',
      'Prioritize movement quality over volume'
    ],
    nutritionTips: [
      'Ensure adequate protein intake (1.6g per kg bodyweight)',
      'Stay hydrated throughout the day',
      'Consider a pre-workout meal 2 hours before training'
    ],
    recoveryTips: [
      'Get 8 hours of sleep tonight',
      'Consider a light stretching session',
      'Use foam rolling for any tight areas'
    ]
  }
}: RecoveryDashboardProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntensityBadge = (intensity: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      rest: { color: 'bg-gray-500', label: 'Rest Day' },
      easy: { color: 'bg-green-500', label: 'Easy Session' },
      moderate: { color: 'bg-yellow-500', label: 'Moderate' },
      hard: { color: 'bg-orange-500', label: 'Push Hard' },
      peak: { color: 'bg-red-500', label: 'Peak Performance' },
    };
    const variant = variants[intensity] || variants.moderate;
    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  const getTrendIcon = (current: number, threshold: number) => {
    if (current > threshold) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < threshold) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Recovery Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recovery Dashboard
          </CardTitle>
          <CardDescription>
            Your readiness and recovery metrics for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recovery Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recovery Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(metrics.recoveryScore)}`}>
                  {metrics.recoveryScore}
                </span>
              </div>
              <Progress value={metrics.recoveryScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on HRV, sleep, and stress levels
              </p>
            </div>

            {/* Readiness Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Readiness Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(metrics.readinessScore)}`}>
                  {metrics.readinessScore}
                </span>
              </div>
              <Progress value={metrics.readinessScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Your overall training readiness
              </p>
            </div>

            {/* HRV Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HRV Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(metrics.hrvScore)}`}>
                  {metrics.hrvScore}
                </span>
              </div>
              <Progress value={metrics.hrvScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.hrv}ms - Heart rate variability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Moon className="h-4 w-4" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Duration</span>
              <span className="font-semibold">{metrics.sleepDuration}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Quality Score</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{metrics.sleepQuality}%</span>
                {getTrendIcon(metrics.sleepQuality, 75)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Deep Sleep</span>
                <span>{metrics.deepSleepPercentage}%</span>
              </div>
              <Progress value={metrics.deepSleepPercentage} className="h-1" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>REM Sleep</span>
                <span>{metrics.remSleepPercentage}%</span>
              </div>
              <Progress value={metrics.remSleepPercentage} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Subjective Measures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              How You Feel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Energy Level</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.energyLevel * 10} className="h-2 w-20" />
                <span className="font-semibold">{metrics.energyLevel}/10</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stress Level</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.stressLevel * 10} className="h-2 w-20" />
                <span className="font-semibold">{metrics.stressLevel}/10</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Muscle Soreness</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.musclesoreness * 10} className="h-2 w-20" />
                <span className="font-semibold">{metrics.musclesoreness}/10</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mood</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.mood * 10} className="h-2 w-20" />
                <span className="font-semibold">{metrics.mood}/10</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Today's Recommendation
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {getIntensityBadge(recommendation.recommendedIntensity)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {recommendation.reasoning}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Training Tips */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Training Tips
              </h4>
              <ul className="space-y-1">
                {recommendation.trainingTips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Tips */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Nutrition Tips
              </h4>
              <ul className="space-y-1">
                {recommendation.nutritionTips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recovery Tips */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Recovery Tips
              </h4>
              <ul className="space-y-1">
                {recommendation.recoveryTips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
