import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import type { TrainingCalendarDay, WorkoutSession } from '@/types/performance';

interface TrainingCalendarProps {
  calendarDays?: TrainingCalendarDay[];
  onDaySelect?: (date: Date) => void;
}

export function TrainingCalendar({ calendarDays = [], onDaySelect }: TrainingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Sample data for demonstration
  const sampleWorkouts: Record<string, WorkoutSession> = {
    [format(new Date(), 'yyyy-MM-dd')]: {
      id: '1',
      userId: 'user1',
      date: new Date(),
      type: 'cardio',
      duration: 45,
      intensity: 75,
      executionScore: 85,
      completionRate: 90,
      perceivedEffort: 7,
      enjoyment: 8,
      notes: 'Great run! Felt strong throughout'
    },
  };

  const getWorkoutForDay = (date: Date): WorkoutSession | null => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return sampleWorkouts[dateKey] || null;
  };

  const getIntensityColor = (intensity?: number) => {
    if (!intensity) return 'bg-gray-300';
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    onDaySelect?.(date);
  };

  const renderDayDetails = (date: Date) => {
    const workout = getWorkoutForDay(date);
    
    if (!workout) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No workout logged for this day</p>
          <Button className="mt-4" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Workout Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{workout.type}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{workout.duration} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Intensity:</span>
              <span className="font-medium">{workout.intensity}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execution Score:</span>
              <span className="font-medium">{workout.executionScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">RPE:</span>
              <span className="font-medium">{workout.perceivedEffort}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Enjoyment:</span>
              <span className="font-medium">{workout.enjoyment}/10</span>
            </div>
          </div>
        </div>

        {workout.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Training Calendar
            </CardTitle>
            <CardDescription>
              View and plan your workouts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const workout = getWorkoutForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                      ${isTodayDate ? 'ring-2 ring-primary' : ''}
                      ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-sm ${isTodayDate ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {workout && (
                        <div className={`w-2 h-2 rounded-full mt-1 ${getIntensityColor(workout.intensity)}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Hard</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Intense</span>
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : 'Select a day'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDay ? renderDayDetails(selectedDay) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click on a day to view details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
