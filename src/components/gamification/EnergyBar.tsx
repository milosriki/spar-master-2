import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Battery, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnergyBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  className?: string;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max,
  showLabel = true,
  className
}) => {
  const percentage = (current / max) * 100;
  
  const getEnergyColor = () => {
    if (percentage >= 70) return 'bg-gradient-success';
    if (percentage >= 40) return 'bg-gradient-warning';
    return 'bg-gradient-danger';
  };

  const getEnergyStatus = () => {
    if (percentage >= 70) return { status: 'High Energy', icon: Zap, color: 'text-energy-high' };
    if (percentage >= 40) return { status: 'Medium Energy', icon: Battery, color: 'text-energy-medium' };
    return { status: 'Low Energy', icon: Battery, color: 'text-energy-low' };
  };

  const { status, icon: Icon, color } = getEnergyStatus();

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', color)} />
            <span className="text-sm font-medium text-foreground">{status}</span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {current}/{max}
          </span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-3 bg-secondary/30"
        />
        <div 
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-300',
            getEnergyColor()
          )}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Glow effect for high energy */}
        {percentage >= 70 && (
          <div 
            className="absolute top-0 left-0 h-full bg-energy-high/30 rounded-full blur-sm"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      
      {/* Energy boost animation */}
      {percentage >= 90 && (
        <div className="flex items-center gap-1 text-xs text-energy-high animate-pulse">
          <Zap className="h-3 w-3" />
          <span>Peak Performance!</span>
        </div>
      )}
    </div>
  );
};