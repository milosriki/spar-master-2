import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Target } from 'lucide-react';
import type { PerformanceMetrics, PerformanceTrend } from '@/types/performance';

interface PerformanceAnalyticsProps {
  metrics?: PerformanceMetrics;
}

export function PerformanceAnalytics({ 
  metrics = {
    ctl: 65,
    atl: 48,
    tsb: 17,
    weeklyVolume: 320,
    weeklyIntensity: 68,
    trainingImpulse: 450
  }
}: PerformanceAnalyticsProps) {

  // Sample data for charts
  const fitnessData = [
    { date: 'Week 1', ctl: 45, atl: 35, tsb: 10 },
    { date: 'Week 2', ctl: 50, atl: 38, tsb: 12 },
    { date: 'Week 3', ctl: 55, atl: 42, tsb: 13 },
    { date: 'Week 4', ctl: 60, atl: 45, tsb: 15 },
    { date: 'Week 5', ctl: 65, atl: 48, tsb: 17 },
  ];

  const volumeData = [
    { day: 'Mon', minutes: 45, intensity: 65 },
    { day: 'Tue', minutes: 60, intensity: 75 },
    { day: 'Wed', minutes: 30, intensity: 50 },
    { day: 'Thu', minutes: 75, intensity: 80 },
    { day: 'Fri', minutes: 0, intensity: 0 },
    { day: 'Sat', minutes: 90, intensity: 70 },
    { day: 'Sun', minutes: 60, intensity: 60 },
  ];

  const performanceTrends: PerformanceTrend[] = [
    {
      metric: 'Average Pace',
      data: [],
      trend: 'improving',
      percentageChange: 5.2,
      timeframe: 'month'
    },
    {
      metric: 'Weekly Volume',
      data: [],
      trend: 'improving',
      percentageChange: 12.5,
      timeframe: 'month'
    },
    {
      metric: 'Recovery Score',
      data: [],
      trend: 'stable',
      percentageChange: 1.2,
      timeframe: 'month'
    }
  ];

  const getTSBStatus = (tsb: number) => {
    if (tsb > 25) return { label: 'Fresh', color: 'bg-green-500', text: 'text-green-500' };
    if (tsb > 5) return { label: 'Optimal', color: 'bg-blue-500', text: 'text-blue-500' };
    if (tsb > -10) return { label: 'Neutral', color: 'bg-yellow-500', text: 'text-yellow-500' };
    if (tsb > -30) return { label: 'Productive', color: 'bg-orange-500', text: 'text-orange-500' };
    return { label: 'Overreaching', color: 'bg-red-500', text: 'text-red-500' };
  };

  const tsbStatus = getTSBStatus(metrics.tsb);

  return (
    <div className="space-y-4">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fitness (CTL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.ctl}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Chronic Training Load
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Long-term fitness
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Fatigue (ATL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.atl}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Acute Training Load
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Recent stress
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Form (TSB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.tsb}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Training Stress Balance
            </p>
            <div className="mt-2">
              <Badge className={`${tsbStatus.color} text-white text-xs`}>
                {tsbStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>
            Track your fitness, fatigue, and form over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fitness" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fitness">Fitness Trends</TabsTrigger>
              <TabsTrigger value="volume">Weekly Volume</TabsTrigger>
              <TabsTrigger value="trends">Key Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="fitness" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fitnessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ctl" stroke="#10b981" name="Fitness (CTL)" strokeWidth={2} />
                  <Line type="monotone" dataKey="atl" stroke="#f59e0b" name="Fatigue (ATL)" strokeWidth={2} />
                  <Line type="monotone" dataKey="tsb" stroke="#3b82f6" name="Form (TSB)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>CTL (Fitness):</strong> Your long-term training adaptation. Higher is better.</p>
                <p><strong>ATL (Fatigue):</strong> Your recent training stress. Watch for rapid increases.</p>
                <p><strong>TSB (Form):</strong> The difference between fitness and fatigue. Positive = Fresh, Negative = Fatigued.</p>
              </div>
            </TabsContent>

            <TabsContent value="volume" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="minutes" fill="#3b82f6" name="Duration (min)" />
                  <Bar yAxisId="right" dataKey="intensity" fill="#f59e0b" name="Intensity (%)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.weeklyVolume}</div>
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.weeklyIntensity}%</div>
                  <p className="text-sm text-muted-foreground">Avg Intensity</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-4">
              <div className="space-y-4">
                {performanceTrends.map((trend, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {trend.trend === 'improving' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {trend.trend === 'declining' && <TrendingDown className="h-5 w-5 text-red-500" />}
                      {trend.trend === 'stable' && <Activity className="h-5 w-5 text-yellow-500" />}
                      <div>
                        <p className="font-semibold">{trend.metric}</p>
                        <p className="text-xs text-muted-foreground">Last {trend.timeframe}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        trend.trend === 'improving' ? 'text-green-500' : 
                        trend.trend === 'declining' ? 'text-red-500' : 
                        'text-yellow-500'
                      }`}>
                        {trend.trend === 'declining' ? '-' : '+'}{trend.percentageChange}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Training Impulse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Training Impulse (TRIMP)</CardTitle>
          <CardDescription>
            A measure of your overall training stress this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{metrics.trainingImpulse}</div>
            <Badge variant="secondary">This Week</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Higher TRIMP indicates more training stress. Balance with recovery for optimal adaptation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
