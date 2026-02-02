import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Coins, 
  Gem, 
  Zap, 
  TrendingUp,
  Shield,
  Sword,
  Crown
} from 'lucide-react';
import type { GameState } from '@/types/gamification';
import { cn } from '@/lib/utils';

interface CharacterStatsProps {
  gameState: GameState;
  className?: string;
}

export function CharacterStats({ gameState, className }: CharacterStatsProps) {
  const hpPercentage = (gameState.currentHP / gameState.maxHP) * 100;
  const xpPercentage = (gameState.totalXP / gameState.xpToNextLevel) * 100;
  
  const getHPColor = () => {
    if (hpPercentage > 60) return 'bg-green-500';
    if (hpPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getClassIcon = () => {
    switch (gameState.characterClass) {
      case 'warrior': return <Sword className="h-4 w-4" />;
      case 'mage': return <Zap className="h-4 w-4" />;
      case 'healer': return <Heart className="h-4 w-4" />;
      case 'rogue': return <Shield className="h-4 w-4" />;
      default: return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getClassIcon()}
            Your Character
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            Level {gameState.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className={cn('h-4 w-4', hpPercentage > 60 ? 'text-green-500' : hpPercentage > 30 ? 'text-yellow-500' : 'text-red-500')} />
              <span className="font-medium">Health</span>
            </div>
            <span className="text-muted-foreground">
              {gameState.currentHP} / {gameState.maxHP}
            </span>
          </div>
          <Progress value={hpPercentage} className={cn('h-3', getHPColor())} />
        </div>

        {/* XP Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Experience</span>
            </div>
            <span className="text-muted-foreground">
              {gameState.totalXP} / {gameState.xpToNextLevel}
            </span>
          </div>
          <Progress value={xpPercentage} className="h-3 bg-blue-500" />
        </div>

        {/* Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Gold</p>
              <p className="text-lg font-bold text-yellow-600">{gameState.gold}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Gem className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Gems</p>
              <p className="text-lg font-bold text-purple-600">{gameState.gems}</p>
            </div>
          </div>
        </div>

        {/* Class Badge */}
        {gameState.characterClass && (
          <div className="pt-2 border-t">
            <Badge className="w-full justify-center capitalize">
              {gameState.characterClass}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
