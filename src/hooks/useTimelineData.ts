import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import type { FoodLog, MealData, SnackData } from '../types';
import { firestoreService } from '../services/firestore';
import { useAuth } from './useAuth';
import { getDateKey, loadFromLocalStorage } from '../utils';

export interface TimelineEntryData {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'water' | 'exercise' | 'sleep';
  title: string;
  content: string;
  waterIntake: number;
}

export interface TimelineDayData {
  id: string;
  date: string;
  displayDate: string;
  entries: TimelineEntryData[];
}

const hasContent = (data: MealData | SnackData | string): boolean => {
  if (typeof data === 'string') {
    return data.trim() !== '';
  }
  return Object.values(data).some(value => value && value.toString().trim() !== '');
};

const formatFoodContent = (meal: MealData): string => {
  const parts = [];
  if (meal.meatDairy.trim()) parts.push(meal.meatDairy);
  if (meal.vegetablesFruits.trim()) parts.push(meal.vegetablesFruits);
  if (meal.breadsCerealsGrains.trim()) parts.push(meal.breadsCerealsGrains);
  if (meal.fats.trim()) parts.push(meal.fats);
  if (meal.candySweets.trim()) parts.push(meal.candySweets);
  if (meal.otherDrinks.trim()) parts.push(meal.otherDrinks);
  
  return parts.length > 0 ? parts.join(', ') : 'No details recorded';
};

const parseWaterIntake = (waterStr: string): number => {
  if (!waterStr) return 0;
  const match = waterStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const convertFoodLogToTimelineEntries = (foodLog: FoodLog): TimelineEntryData[] => {
  const entries: TimelineEntryData[] = [];

  // Add meals
  if (hasContent(foodLog.breakfast)) {
    entries.push({
      time: foodLog.breakfast.time || '8:00 AM',
      type: 'breakfast',
      title: 'Breakfast',
      content: formatFoodContent(foodLog.breakfast),
      waterIntake: parseWaterIntake(foodLog.breakfast.waterIntake)
    });
  }

  if (hasContent(foodLog.lunch)) {
    entries.push({
      time: foodLog.lunch.time || '12:00 PM',
      type: 'lunch',
      title: 'Lunch',
      content: formatFoodContent(foodLog.lunch),
      waterIntake: parseWaterIntake(foodLog.lunch.waterIntake)
    });
  }

  if (hasContent(foodLog.dinner)) {
    entries.push({
      time: foodLog.dinner.time || '6:00 PM',
      type: 'dinner',
      title: 'Dinner',
      content: formatFoodContent(foodLog.dinner),
      waterIntake: parseWaterIntake(foodLog.dinner.waterIntake)
    });
  }

  // Add snacks
  if (hasContent(foodLog.midMorningSnack)) {
    entries.push({
      time: foodLog.midMorningSnack.time || '10:00 AM',
      type: 'snack',
      title: 'Mid-Morning Snack',
      content: foodLog.midMorningSnack.snack,
      waterIntake: 0
    });
  }

  if (hasContent(foodLog.midDaySnack)) {
    entries.push({
      time: foodLog.midDaySnack.time || '3:00 PM',
      type: 'snack',
      title: 'Afternoon Snack',
      content: foodLog.midDaySnack.snack,
      waterIntake: 0
    });
  }

  if (hasContent(foodLog.nighttimeSnack)) {
    entries.push({
      time: foodLog.nighttimeSnack.time || '9:00 PM',
      type: 'snack',
      title: 'Evening Snack',
      content: foodLog.nighttimeSnack.snack,
      waterIntake: 0
    });
  }

  // Add water intake if recorded separately
  if (hasContent(foodLog.dailyWaterIntake)) {
    entries.push({
      time: '12:00 PM',
      type: 'water',
      title: 'Daily Water Intake',
      content: foodLog.dailyWaterIntake,
      waterIntake: parseWaterIntake(foodLog.dailyWaterIntake)
    });
  }

  // Add exercise if recorded
  if (hasContent(foodLog.exercise)) {
    entries.push({
      time: '6:00 AM',
      type: 'exercise',
      title: 'Exercise',
      content: foodLog.exercise,
      waterIntake: 0
    });
  }

  // Add sleep if recorded
  if (foodLog.sleepQuality > 0 || hasContent(foodLog.sleepHours)) {
    const sleepContent = [];
    if (hasContent(foodLog.sleepHours)) sleepContent.push(`${foodLog.sleepHours}`);
    if (foodLog.sleepQuality > 0) {
      // Handle both old scale (1-5) and new scale (0-100)
      const qualityDisplay = foodLog.sleepQuality <= 5 
        ? `Quality: ${foodLog.sleepQuality}/5` 
        : `Quality: ${foodLog.sleepQuality}%`;
      sleepContent.push(qualityDisplay);
    }
    
    entries.push({
      time: '11:00 PM',
      type: 'sleep',
      title: 'Sleep',
      content: sleepContent.join(', ') || 'Sleep recorded',
      waterIntake: 0
    });
  }

  // Sort entries by time
  return entries.sort((a, b) => {
    const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
    const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
    return timeA - timeB;
  });
};

export function useTimelineData(days: number = 7) {
  const { user } = useAuth();
  const [timelineData, setTimelineData] = useState<TimelineDayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTimelineData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const timelineEntries: TimelineDayData[] = [];

      for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);
        const dateKey = getDateKey(date);
        let foodLog: FoodLog | null = null;

        if (user) {
          // Try to load from Firestore first
          const result = await firestoreService.getFoodLogByDate(user.uid, dateKey);
          if (result.success && result.data) {
            foodLog = result.data;
          }
        }

        // If no Firestore data, try local storage
        if (!foodLog) {
          foodLog = loadFromLocalStorage(date);
        }

        // Convert to timeline entries if we have data
        const entries = foodLog ? convertFoodLogToTimelineEntries(foodLog) : [];

        // Only add days that have entries
        if (entries.length > 0) {
          timelineEntries.push({
            id: `day-${dateKey}`,
            date: dateKey,
            displayDate: format(date, 'MMM d, yyyy'),
            entries
          });
        }
      }

      setTimelineData(timelineEntries);
    } catch (err) {
      setError('Failed to load timeline data');
      console.error('Error loading timeline data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  const refreshTimelineData = useCallback(() => {
    return loadTimelineData();
  }, [loadTimelineData]);

  const getDaySummary = useCallback((date: Date) => {
    const dateKey = getDateKey(date);
    const dayData = timelineData.find(day => day.date === dateKey);
    
    if (!dayData) {
      return { meals: 0, snacks: 0, waterIntake: 0 };
    }

    const meals = dayData.entries.filter(entry => 
      ['breakfast', 'lunch', 'dinner'].includes(entry.type)
    ).length;

    const snacks = dayData.entries.filter(entry => 
      entry.type === 'snack'
    ).length;

    const waterIntake = dayData.entries.reduce((total, entry) => 
      total + entry.waterIntake, 0
    );

    return { meals, snacks, waterIntake };
  }, [timelineData]);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]);

  return {
    timelineData,
    loading,
    error,
    refreshTimelineData,
    getDaySummary
  };
}