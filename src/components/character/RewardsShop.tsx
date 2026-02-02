import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Coins, 
  Gem,
  Sword,
  Shield,
  Crown,
  Heart,
  Sparkles,
  Gift
} from 'lucide-react';
import type { InventoryItem, Reward } from '@/types/gamification';
import { cn } from '@/lib/utils';

interface RewardsShopProps {
  gold: number;
  gems: number;
  onPurchase: (item: InventoryItem | Reward, cost: number, currency: 'gold' | 'gems') => void;
}

export function RewardsShop({ gold, gems, onPurchase }: RewardsShopProps) {
  const [selectedTab, setSelectedTab] = useState<'equipment' | 'rewards' | 'pets'>('equipment');

  const equipmentItems: InventoryItem[] = [
    {
      id: 'sword-1',
      name: 'Steel Sword',
      type: 'weapon',
      description: 'A reliable blade for fitness warriors',
      goldCost: 100,
      stats: { strength: 5 },
      icon: 'sword',
      rarity: 'common',
      quantity: 1
    },
    {
      id: 'armor-1',
      name: 'Leather Armor',
      type: 'armor',
      description: 'Basic protection for your fitness journey',
      goldCost: 150,
      stats: { constitution: 3 },
      icon: 'shield',
      rarity: 'common',
      quantity: 1
    },
    {
      id: 'crown-1',
      name: 'Champion Crown',
      type: 'head',
      description: 'Show off your elite status',
      goldCost: 500,
      gemCost: 10,
      stats: { perception: 8 },
      icon: 'crown',
      rarity: 'rare',
      quantity: 1
    },
    {
      id: 'sword-epic',
      name: 'Dragon Slayer Sword',
      type: 'weapon',
      description: 'Legendary weapon for true champions',
      goldCost: 1000,
      gemCost: 25,
      stats: { strength: 15 },
      icon: 'sword',
      rarity: 'epic',
      quantity: 1
    }
  ];

  const customRewards: Reward[] = [
    {
      id: 'reward-1',
      name: 'Coffee Break',
      description: 'Enjoy a premium coffee guilt-free',
      goldCost: 50,
      type: 'custom',
      icon: 'gift',
      createdAt: new Date()
    },
    {
      id: 'reward-2',
      name: 'Movie Night',
      description: 'Watch your favorite movie tonight',
      goldCost: 200,
      type: 'custom',
      icon: 'gift',
      createdAt: new Date()
    },
    {
      id: 'reward-3',
      name: 'Spa Day',
      description: 'Treat yourself to a relaxing spa session',
      goldCost: 500,
      type: 'custom',
      icon: 'gift',
      createdAt: new Date()
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'uncommon': return 'text-green-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'sword': return <Sword className="h-6 w-6" />;
      case 'shield': return <Shield className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      case 'heart': return <Heart className="h-6 w-6" />;
      case 'gift': return <Gift className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  const canAfford = (item: InventoryItem | Reward, currency: 'gold' | 'gems') => {
    if (currency === 'gold') {
      const cost = 'goldCost' in item ? item.goldCost : 0;
      return gold >= cost;
    } else {
      const cost = 'gemCost' in item && item.gemCost ? item.gemCost : 0;
      return gems >= cost;
    }
  };

  const renderEquipmentCard = (item: InventoryItem) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg bg-gradient-to-br', 
            item.rarity === 'epic' ? 'from-purple-500 to-pink-500' :
            item.rarity === 'rare' ? 'from-blue-500 to-cyan-500' :
            'from-gray-500 to-gray-600'
          )}>
            {getItemIcon(item.icon)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.type}
                </p>
              </div>
              <Badge variant="outline" className={getRarityColor(item.rarity)}>
                {item.rarity}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
            
            {item.stats && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <Badge key={stat} variant="secondary" className="text-xs">
                    +{value} {stat}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">{item.goldCost}</span>
                </div>
                {item.gemCost && (
                  <div className="flex items-center gap-1 text-sm">
                    <Gem className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">{item.gemCost}</span>
                  </div>
                )}
              </div>
              
              <Button 
                size="sm"
                onClick={() => onPurchase(item, item.goldCost, 'gold')}
                disabled={!canAfford(item, 'gold')}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Buy
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRewardCard = (reward: Reward) => (
    <Card key={reward.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
            {getItemIcon(reward.icon)}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold">{reward.name}</h4>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">{reward.goldCost}</span>
              </div>
              
              <Button 
                size="sm"
                onClick={() => onPurchase(reward, reward.goldCost, 'gold')}
                disabled={!canAfford(reward, 'gold')}
              >
                Claim
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Rewards Shop
            </CardTitle>
            <CardDescription>
              Spend your gold and gems on equipment and rewards
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold">{gold}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Gem className="h-4 w-4 text-purple-600" />
              <span className="font-semibold">{gems}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedTab === 'equipment' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('equipment')}
          >
            Equipment
          </Button>
          <Button
            variant={selectedTab === 'rewards' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('rewards')}
          >
            Custom Rewards
          </Button>
          <Button
            variant={selectedTab === 'pets' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('pets')}
          >
            Pets & Mounts
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {selectedTab === 'equipment' && equipmentItems.map(renderEquipmentCard)}
          {selectedTab === 'rewards' && customRewards.map(renderRewardCard)}
          {selectedTab === 'pets' && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Pets and mounts coming soon!</p>
              <p className="text-sm mt-2">Complete quests to unlock special companions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
