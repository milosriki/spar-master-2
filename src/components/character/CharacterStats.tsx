import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GameState, CharacterClass } from '@/types/gamification';
import { Heart, Coins, Gem, Shield, Swords, Sparkles, Zap } from 'lucide-react';

interface CharacterStatsProps {
  gameState: GameState;
}

const CLASS_CONFIG: Record<CharacterClass, { label: string; color: string; icon: React.ReactNode }> = {
  warrior: { label: 'Warrior', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Swords className="w-3.5 h-3.5" /> },
  mage: { label: 'Mage', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Sparkles className="w-3.5 h-3.5" /> },
  healer: { label: 'Healer', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <Heart className="w-3.5 h-3.5" /> },
  rogue: { label: 'Rogue', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Zap className="w-3.5 h-3.5" /> },
};

const getHPColor = (percentage: number): string => {
  if (percentage > 60) return 'bg-emerald-500';
  if (percentage > 30) return 'bg-amber-500';
  return 'bg-red-500';
};

const getXPColor = (): string => 'bg-indigo-500';

export const CharacterStats: React.FC<CharacterStatsProps> = ({ gameState }) => {
  const {
    currentHP, maxHP, gold, gems, level,
    totalXP, xpToNextLevel, characterClass, currentStreak,
  } = gameState;

  const hpPercentage = (currentHP / maxHP) * 100;
  const xpForLevel = Math.pow(level, 2) * 100;
  const currentLevelXP = totalXP - Math.pow(level - 1, 2) * 100;
  const xpPercentage = (currentLevelXP / (xpForLevel - Math.pow(level - 1, 2) * 100)) * 100;
  const classConfig = CLASS_CONFIG[characterClass];

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Character
          </CardTitle>
          <Badge variant="outline" className={`${classConfig.color} border flex items-center gap-1 px-2.5 py-0.5`}>
            {classConfig.icon}
            {classConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Level Badge */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center ring-2 ring-orange-400/30 shadow-lg shadow-orange-500/20">
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium tracking-wider uppercase">Level</span>
          </div>
        </div>

        {/* HP Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
              Health
            </span>
            <span className="text-slate-400 font-mono text-xs">
              {currentHP}/{maxHP}
            </span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${getHPColor(hpPercentage)} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Experience
            </span>
            <span className="text-slate-400 font-mono text-xs">
              {xpToNextLevel} XP to next
            </span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${getXPColor()} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, xpPercentage)}%` }}
            />
          </div>
        </div>

        {/* Currency + Streak Row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/50 border border-amber-500/10">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-300">{gold}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Gold</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/50 border border-cyan-500/10">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-300">{gems}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Gems</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/50 border border-orange-500/10">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-300">{currentStreak}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterStats;
