import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Trophy, MapPin, Users, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaderboardEntry } from '@/types/gamification';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}

// Mock data - will be replaced with real data from backend
const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
  { userId: '1', name: 'Ahmed K.', location: 'DIFC', points: 15420, rank: 1, streak: 34, level: 28, avatar: '🧑‍💼' },
  { userId: '2', name: 'Sarah M.', location: 'Marina', points: 14850, rank: 2, streak: 28, level: 26, avatar: '👩‍💼' },
  { userId: '3', name: 'Omar R.', location: 'JBR', points: 14200, rank: 3, streak: 25, level: 25, avatar: '🧑‍💼' },
  { userId: '4', name: 'Layla H.', location: 'DIFC', points: 13800, rank: 4, streak: 31, level: 24, avatar: '👩‍💼' },
  { userId: '5', name: 'Khalid A.', location: 'Business Bay', points: 13450, rank: 5, streak: 22, level: 23, avatar: '🧑‍💼' },
  { userId: '6', name: 'Fatima S.', location: 'Marina', points: 13100, rank: 6, streak: 19, level: 22, avatar: '👩‍💼' },
  { userId: '7', name: 'Hassan M.', location: 'Downtown', points: 12750, rank: 7, streak: 26, level: 21, avatar: '🧑‍💼' },
  { userId: '8', name: 'Noor A.', location: 'DIFC', points: 12400, rank: 8, streak: 15, level: 20, avatar: '👩‍💼', isCurrentUser: true },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries = MOCK_LEADERBOARD_DATA,
  currentUserId,
  className
}) => {
  const [selectedTab, setSelectedTab] = useState('global');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-accent" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Trophy className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-warning border-accent/30';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-orange-100 border-orange-300';
      default: return 'bg-secondary border-border';
    }
  };

  const filterByLocation = (location: string) => {
    return entries.filter(entry => entry.location === location);
  };

  const TopThreeDisplay = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* 2nd Place */}
      <div className="text-center pt-6">
        {entries[1] && (
          <div className="space-y-2">
            <div className="relative">
              <Avatar className="h-16 w-16 mx-auto bg-gray-100 border-4 border-gray-300">
                <AvatarFallback className="text-2xl">{entries[1].avatar}</AvatarFallback>
              </Avatar>
              <Medal className="absolute -top-2 -right-2 h-6 w-6 text-gray-400" />
            </div>
            <div>
              <div className="font-bold text-foreground">{entries[1].name}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {entries[1].location}
              </div>
            </div>
            <div className="text-sm font-bold text-foreground">{entries[1].points.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* 1st Place */}
      <div className="text-center">
        {entries[0] && (
          <div className="space-y-2">
            <div className="relative">
              <Avatar className="h-20 w-20 mx-auto bg-gradient-warning border-4 border-accent/30">
                <AvatarFallback className="text-3xl">{entries[0].avatar}</AvatarFallback>
              </Avatar>
              <Crown className="absolute -top-3 -right-3 h-8 w-8 text-accent" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">{entries[0].name}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {entries[0].location}
              </div>
            </div>
            <div className="text-lg font-bold text-accent">{entries[0].points.toLocaleString()}</div>
            <Badge className="bg-accent text-accent-foreground">Champion</Badge>
          </div>
        )}
      </div>

      {/* 3rd Place */}
      <div className="text-center pt-8">
        {entries[2] && (
          <div className="space-y-2">
            <div className="relative">
              <Avatar className="h-14 w-14 mx-auto bg-orange-100 border-4 border-orange-300">
                <AvatarFallback className="text-xl">{entries[2].avatar}</AvatarFallback>
              </Avatar>
              <Trophy className="absolute -top-2 -right-2 h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="font-bold text-foreground">{entries[2].name}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {entries[2].location}
              </div>
            </div>
            <div className="text-sm font-bold text-foreground">{entries[2].points.toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {entries.slice(3).map((entry) => (
        <div 
          key={entry.userId}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-colors',
            entry.isCurrentUser 
              ? 'bg-primary/10 border border-primary/20' 
              : 'bg-secondary/30 hover:bg-secondary/50'
          )}
        >
          <div className="flex items-center justify-center w-8">
            {getRankIcon(entry.rank)}
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarFallback>{entry.avatar}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-semibold',
                entry.isCurrentUser ? 'text-primary' : 'text-foreground'
              )}>
                {entry.name}
              </span>
              {entry.isCurrentUser && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{entry.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-streak" />
                <span>{entry.streak} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-level" />
                <span>L{entry.level}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-foreground">{entry.points.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Elite Leaderboard
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global" className="gap-2">
              <Users className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="difc" className="gap-2">
              <MapPin className="h-4 w-4" />
              DIFC
            </TabsTrigger>
            <TabsTrigger value="marina" className="gap-2">
              <MapPin className="h-4 w-4" />
              Marina
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-6">
            <TopThreeDisplay entries={entries} />
            <LeaderboardList entries={entries} />
          </TabsContent>

          <TabsContent value="difc" className="mt-6">
            <TopThreeDisplay entries={filterByLocation('DIFC')} />
            <LeaderboardList entries={filterByLocation('DIFC')} />
          </TabsContent>

          <TabsContent value="marina" className="mt-6">
            <TopThreeDisplay entries={filterByLocation('Marina')} />
            <LeaderboardList entries={filterByLocation('Marina')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};