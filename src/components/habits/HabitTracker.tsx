import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ListTodo,
  Repeat,
  Target
} from 'lucide-react';
import type { Habit, HabitType } from '@/types/habits';
import { HabitDialog } from './HabitDialog';
import { format } from 'date-fns';

interface HabitTrackerProps {
  onHabitComplete: (habitId: string, xp: number) => void;
}

export function HabitTracker({ onHabitComplete }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      type: 'daily',
      title: 'Morning Workout',
      notes: '30 minutes of exercise to start the day',
      difficulty: 'medium',
      recurrence: 'daily',
      streak: 5,
      category: 'fitness',
      xpValue: 30,
      energyCost: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      type: 'habit',
      title: 'Drink Water',
      notes: 'Stay hydrated throughout the day',
      difficulty: 'easy',
      direction: 'positive',
      positiveCount: 8,
      category: 'wellness',
      xpValue: 10,
      energyCost: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      type: 'todo',
      title: 'Complete Nutrition Plan',
      notes: 'Plan meals for the week',
      difficulty: 'medium',
      completed: false,
      category: 'wellness',
      xpValue: 20,
      energyCost: 10,
      dueDate: new Date(Date.now() + 86400000 * 2),
      checklist: [
        { id: 'c1', text: 'Research healthy recipes', completed: true },
        { id: 'c2', text: 'Create shopping list', completed: false },
        { id: 'c3', text: 'Schedule meal prep time', completed: false },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleHabitAction = (habitId: string, action: 'positive' | 'negative' | 'complete') => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const updatedHabit = { ...habit, lastCompletedAt: new Date() };

      if (habit.type === 'habit') {
        if (action === 'positive') {
          updatedHabit.positiveCount = (habit.positiveCount || 0) + 1;
          onHabitComplete(habitId, habit.xpValue);
        } else if (action === 'negative') {
          updatedHabit.negativeCount = (habit.negativeCount || 0) + 1;
        }
      } else if (habit.type === 'daily') {
        updatedHabit.streak = (habit.streak || 0) + 1;
        onHabitComplete(habitId, habit.xpValue);
      } else if (habit.type === 'todo') {
        updatedHabit.completed = true;
        updatedHabit.completedAt = new Date();
        onHabitComplete(habitId, habit.xpValue);
      }

      return updatedHabit;
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial': return 'bg-gray-500';
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (type: HabitType) => {
    switch (type) {
      case 'habit': return <Repeat className="h-4 w-4" />;
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'todo': return <ListTodo className="h-4 w-4" />;
    }
  };

  const filterHabitsByType = (type: HabitType) => {
    return habits.filter(h => h.type === type);
  };

  const renderHabitCard = (habit: Habit) => (
    <Card key={habit.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(habit.type)}
              <h4 className="font-semibold">{habit.title}</h4>
              <div className={`h-2 w-2 rounded-full ${getDifficultyColor(habit.difficulty)}`} />
            </div>
            
            {habit.notes && (
              <p className="text-sm text-muted-foreground mb-2">{habit.notes}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                +{habit.xpValue} XP
              </Badge>
              
              {habit.category && (
                <Badge variant="secondary" className="text-xs">
                  {habit.category}
                </Badge>
              )}

              {habit.type === 'daily' && habit.streak && (
                <Badge variant="default" className="text-xs">
                  🔥 {habit.streak} day streak
                </Badge>
              )}

              {habit.type === 'todo' && habit.dueDate && (
                <Badge variant="outline" className="text-xs">
                  Due: {format(habit.dueDate, 'MMM d')}
                </Badge>
              )}
            </div>

            {habit.type === 'todo' && habit.checklist && (
              <div className="mt-3">
                <Progress 
                  value={(habit.checklist.filter(i => i.completed).length / habit.checklist.length) * 100} 
                  className="h-2 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {habit.checklist.filter(i => i.completed).length} of {habit.checklist.length} items completed
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {habit.type === 'habit' && habit.direction !== 'negative' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleHabitAction(habit.id, 'positive')}
                className="bg-green-600 hover:bg-green-700"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            )}
            
            {habit.type === 'habit' && habit.direction !== 'positive' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleHabitAction(habit.id, 'negative')}
              >
                <TrendingDown className="h-4 w-4" />
              </Button>
            )}

            {habit.type === 'daily' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleHabitAction(habit.id, 'complete')}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}

            {habit.type === 'todo' && !habit.completed && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleHabitAction(habit.id, 'complete')}
              >
                <Circle className="h-4 w-4" />
              </Button>
            )}
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
              <Target className="h-5 w-5" />
              Habit Tracker
            </CardTitle>
            <CardDescription>
              Track your habits, dailies, and to-dos to earn XP and build streaks
            </CardDescription>
          </div>
          <Button onClick={() => { setEditingHabit(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="habit">Habits</TabsTrigger>
            <TabsTrigger value="daily">Dailies</TabsTrigger>
            <TabsTrigger value="todo">To-Dos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {habits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No habits yet. Click "Add Habit" to get started!
              </div>
            ) : (
              habits.map(renderHabitCard)
            )}
          </TabsContent>
          
          <TabsContent value="habit" className="mt-4">
            {filterHabitsByType('habit').map(renderHabitCard)}
          </TabsContent>
          
          <TabsContent value="daily" className="mt-4">
            {filterHabitsByType('daily').map(renderHabitCard)}
          </TabsContent>
          
          <TabsContent value="todo" className="mt-4">
            {filterHabitsByType('todo').map(renderHabitCard)}
          </TabsContent>
        </Tabs>
      </CardContent>

      <HabitDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        onSave={(habit) => {
          if (editingHabit) {
            setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
          } else {
            setHabits(prev => [...prev, { ...habit, id: Date.now().toString() }]);
          }
          setDialogOpen(false);
        }}
      />
    </Card>
  );
}
