import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Habit, HabitType, HabitDifficulty, HabitDirection } from '@/types/habits';
import { BASE_XP_VALUES, DIFFICULTY_MULTIPLIERS } from '@/types/habits';

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onSave: (habit: Habit) => void;
}

export function HabitDialog({ open, onOpenChange, habit, onSave }: HabitDialogProps) {
  const [formData, setFormData] = useState<Partial<Habit>>({
    type: 'daily',
    title: '',
    notes: '',
    difficulty: 'medium',
    direction: 'positive',
    category: 'fitness',
    recurrence: 'daily',
  });

  useEffect(() => {
    if (habit) {
      setFormData(habit);
    } else {
      setFormData({
        type: 'daily',
        title: '',
        notes: '',
        difficulty: 'medium',
        direction: 'positive',
        category: 'fitness',
        recurrence: 'daily',
      });
    }
  }, [habit, open]);

  const calculateXP = () => {
    const baseXP = BASE_XP_VALUES[formData.type as HabitType] || 10;
    const multiplier = DIFFICULTY_MULTIPLIERS[formData.difficulty as HabitDifficulty] || 1;
    return Math.round(baseXP * multiplier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHabit: Habit = {
      id: habit?.id || Date.now().toString(),
      type: formData.type as HabitType,
      title: formData.title || '',
      notes: formData.notes,
      difficulty: formData.difficulty as HabitDifficulty,
      direction: formData.direction as HabitDirection,
      category: formData.category as any,
      xpValue: calculateXP(),
      energyCost: formData.type === 'habit' ? 0 : 10,
      createdAt: habit?.createdAt || new Date(),
      updatedAt: new Date(),
      recurrence: formData.recurrence,
      streak: habit?.streak || 0,
      positiveCount: habit?.positiveCount || 0,
      negativeCount: habit?.negativeCount || 0,
    };

    onSave(newHabit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            Set up your habit with details and difficulty level
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as HabitType })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="habit" id="habit" />
                <Label htmlFor="habit" className="font-normal cursor-pointer">
                  Habit - Can be clicked multiple times per day
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal cursor-pointer">
                  Daily - Check off once per day
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todo" id="todo" />
                <Label htmlFor="todo" className="font-normal cursor-pointer">
                  To-Do - One-time task
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning run, Drink water"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value as HabitDifficulty })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trivial">Trivial (0.5x XP)</SelectItem>
                <SelectItem value="easy">Easy (1x XP)</SelectItem>
                <SelectItem value="medium">Medium (1.5x XP)</SelectItem>
                <SelectItem value="hard">Hard (2x XP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Direction (for habits only) */}
          {formData.type === 'habit' && (
            <div className="space-y-2">
              <Label>Direction</Label>
              <RadioGroup
                value={formData.direction}
                onValueChange={(value) => setFormData({ ...formData, direction: value as HabitDirection })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="positive" />
                  <Label htmlFor="positive" className="font-normal cursor-pointer">
                    Positive only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="negative" />
                  <Label htmlFor="negative" className="font-normal cursor-pointer">
                    Negative only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="font-normal cursor-pointer">
                    Both (track good and bad)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* XP Preview */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>XP Reward:</strong> +{calculateXP()} XP
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
