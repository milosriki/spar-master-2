import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryItem, Reward } from '@/types/gamification';
import {
  ShoppingBag, Coins, Gem, Sword, Shield, Crown,
  Coffee, Film, Music, Gamepad2, Sparkles,
} from 'lucide-react';

interface RewardsShopProps {
  gold: number;
  gems: number;
  onPurchase: (item: InventoryItem | Reward) => Promise<boolean>;
}

const RARITY_STYLES: Record<string, string> = {
  common: 'border-slate-500/30 bg-slate-500/5',
  rare: 'border-blue-500/30 bg-blue-500/5',
  epic: 'border-purple-500/30 bg-purple-500/5',
  legendary: 'border-amber-500/30 bg-amber-500/5 shadow-amber-500/10 shadow-lg',
};

const RARITY_BADGE: Record<string, string> = {
  common: 'bg-slate-500/20 text-slate-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-amber-500/20 text-amber-400',
};

const EQUIPMENT_ITEMS: InventoryItem[] = [
  {
    id: 'wooden-sword', name: 'Wooden Sword', type: 'weapon',
    rarity: 'common', stats: { strength: 2 }, cost: 25, currency: 'gold',
    description: 'A basic training sword.', icon: '⚔️',
  },
  {
    id: 'iron-armor', name: 'Iron Armor', type: 'armor',
    rarity: 'common', stats: { defense: 3 }, cost: 40, currency: 'gold',
    description: 'Standard iron protection.', icon: '🛡️',
  },
  {
    id: 'flame-blade', name: 'Flame Blade', type: 'weapon',
    rarity: 'rare', stats: { strength: 5, fire: 3 }, cost: 100, currency: 'gold',
    description: 'A sword imbued with fire.', icon: '🔥',
  },
  {
    id: 'phantom-helm', name: 'Phantom Helm', type: 'head',
    rarity: 'epic', stats: { defense: 4, stealth: 5 }, cost: 5, currency: 'gems',
    description: 'Helm that phases through attacks.', icon: '👻',
  },
  {
    id: 'golden-shield', name: 'Golden Shield', type: 'shield',
    rarity: 'legendary', stats: { defense: 10, hp: 20 }, cost: 15, currency: 'gems',
    description: 'The legendary shield of champions.', icon: '✨',
  },
];

const CUSTOM_REWARDS: Reward[] = [
  {
    id: 'coffee', name: 'Coffee Break', description: 'Take a 15-min coffee break',
    cost: 50, currency: 'gold', icon: '☕', type: 'custom',
  },
  {
    id: 'movie', name: 'Movie Night', description: 'Watch a movie guilt-free',
    cost: 200, currency: 'gold', icon: '🎬', type: 'custom',
  },
  {
    id: 'music', name: 'New Album', description: 'Buy that album you\'ve been eyeing',
    cost: 300, currency: 'gold', icon: '🎵', type: 'custom',
  },
  {
    id: 'gaming', name: 'Gaming Hour', description: 'One hour of uninterrupted gaming',
    cost: 150, currency: 'gold', icon: '🎮', type: 'custom',
  },
  {
    id: 'cheat-meal', name: 'Cheat Meal', description: 'Enjoy one guilt-free cheat meal',
    cost: 400, currency: 'gold', icon: '🍕', type: 'custom',
  },
];

export const RewardsShop: React.FC<RewardsShopProps> = ({ gold, gems, onPurchase }) => {
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

  const handlePurchase = async (item: InventoryItem | Reward) => {
    const success = await onPurchase(item);
    if (success) {
      setPurchaseAnimation(item.id);
      setTimeout(() => setPurchaseAnimation(null), 600);
    }
  };

  const canAfford = (cost: number, currency: 'gold' | 'gems') =>
    currency === 'gold' ? gold >= cost : gems >= cost;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            Rewards Shop
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-amber-400 font-mono">
              <Coins className="w-4 h-4" /> {gold}
            </span>
            <span className="flex items-center gap-1 text-sm text-cyan-400 font-mono">
              <Gem className="w-4 h-4" /> {gems}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="equipment">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700/30 mb-3">
            <TabsTrigger value="equipment" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Sword className="w-3.5 h-3.5 mr-1" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="mt-0 space-y-2">
            {EQUIPMENT_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${RARITY_STYLES[item.rarity]} ${
                  purchaseAnimation === item.id ? 'scale-95 opacity-50' : ''
                }`}
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{item.name}</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${RARITY_BADGE[item.rarity]}`}>
                      {item.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                  {item.stats && (
                    <div className="flex gap-2 mt-1">
                      {Object.entries(item.stats).map(([stat, val]) => (
                        <span key={stat} className="text-[10px] text-slate-400">
                          +{val} {stat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={canAfford(item.cost, item.currency) ? 'default' : 'outline'}
                  disabled={!canAfford(item.cost, item.currency)}
                  onClick={() => handlePurchase(item)}
                  className="shrink-0 text-xs h-8 px-3"
                >
                  {item.currency === 'gold' ? (
                    <Coins className="w-3 h-3 mr-1 text-amber-400" />
                  ) : (
                    <Gem className="w-3 h-3 mr-1 text-cyan-400" />
                  )}
                  {item.cost}
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="custom" className="mt-0 space-y-2">
            {CUSTOM_REWARDS.map((reward) => (
              <div
                key={reward.id}
                className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 transition-all duration-200 hover:bg-slate-800/60 ${
                  purchaseAnimation === reward.id ? 'scale-95 opacity-50' : ''
                }`}
              >
                <span className="text-2xl shrink-0">{reward.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-200">{reward.name}</span>
                  <p className="text-xs text-slate-500 truncate">{reward.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={canAfford(reward.cost, reward.currency) ? 'default' : 'outline'}
                  disabled={!canAfford(reward.cost, reward.currency)}
                  onClick={() => handlePurchase(reward)}
                  className="shrink-0 text-xs h-8 px-3"
                >
                  <Coins className="w-3 h-3 mr-1 text-amber-400" />
                  {reward.cost}
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RewardsShop;
