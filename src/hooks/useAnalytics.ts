import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { FoodLog } from '../types';

export interface AnalyticsData {
  totalEntries: number;
  streakCount: number;
  weeklyAverage: number;
  mostLoggedMeal: string;
  avgSleepQuality: number;
  avgSleepHours: number;
  totalWaterIntake: number;
  exerciseDays: number;
  weeklyData: WeeklyDataPoint[];
  sleepData: SleepDataPoint[];
  mealDistribution: MealDistribution[];
}

export interface WeeklyDataPoint {
  date: string;
  entries: number;
  sleepQuality: number;
  waterIntake: number;
}

export interface SleepDataPoint {
  date: string;
  quality: number;
  hours: number;
}

export interface MealDistribution {
  meal: string;
  count: number;
}

export const useAnalytics = (dateRange: 'week' | 'month' = 'week') => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateAnalytics = async () => {
      setLoading(true);
      try {
        let allLogs: FoodLog[] = [];
        
        // Try Firestore first, then fall back to localStorage
        try {
          const { getAllLogs } = await import('../services/firestore');
          allLogs = await getAllLogs();
        } catch (firestoreError) {
          console.log('Firestore access failed, falling back to localStorage');
          // Fallback to localStorage
          const localLogs: FoodLog[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('foodLog_')) {
              try {
                const logData = JSON.parse(localStorage.getItem(key) || '');
                if (logData && logData.date) {
                  localLogs.push(logData);
                }
              } catch (parseError) {
                console.warn(`Failed to parse localStorage entry ${key}:`, parseError);
              }
            }
          }
          allLogs = localLogs;
        }
        
        if (!allLogs || allLogs.length === 0) {
          setAnalytics({
            totalEntries: 0,
            streakCount: 0,
            weeklyAverage: 0,
            mostLoggedMeal: 'None',
            avgSleepQuality: 0,
            avgSleepHours: 0,
            totalWaterIntake: 0,
            exerciseDays: 0,
            weeklyData: [],
            sleepData: [],
            mealDistribution: []
          });
          setLoading(false);
          return;
        }

        const now = new Date();
        const daysBack = dateRange === 'week' ? 7 : 30;
        const startDate = subDays(now, daysBack);
        
        // Filter logs within date range
        const filteredLogs = allLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= startDate && logDate <= now;
        });

        // Calculate basic metrics
        const totalEntries = filteredLogs.length;
        
        // Calculate streak (consecutive days with entries)
        const streakCount = calculateStreak(allLogs);
        
        // Weekly average
        const weeklyAverage = Math.round((totalEntries / daysBack) * 7 * 10) / 10;
        
        // Most logged meal
        const mealCounts = calculateMealDistribution(filteredLogs);
        const mostLoggedMeal = mealCounts.length > 0 ? mealCounts[0].meal : 'None';
        
        // Sleep metrics
        const sleepData = filteredLogs
          .filter(log => log.sleepQuality > 0)
          .map(log => ({
            date: log.date,
            quality: log.sleepQuality,
            hours: parseFloat(log.sleepHours) || 0
          }));
          
        const avgSleepQuality = sleepData.length > 0 
          ? Math.round((sleepData.reduce((sum, data) => sum + data.quality, 0) / sleepData.length) * 10) / 10
          : 0;
          
        const avgSleepHours = sleepData.length > 0
          ? Math.round((sleepData.reduce((sum, data) => sum + data.hours, 0) / sleepData.length) * 10) / 10
          : 0;
        
        // Water intake
        const totalWaterIntake = filteredLogs.reduce((sum, log) => {
          const water = parseFloat(log.dailyWaterIntake) || 0;
          return sum + water;
        }, 0);
        
        // Exercise days
        const exerciseDays = filteredLogs.filter(log => 
          log.exercise && log.exercise.trim() !== ''
        ).length;
        
        // Weekly data for charts
        const weeklyData = generateWeeklyData(filteredLogs, startDate, now);
        
        setAnalytics({
          totalEntries,
          streakCount,
          weeklyAverage,
          mostLoggedMeal,
          avgSleepQuality,
          avgSleepHours,
          totalWaterIntake,
          exerciseDays,
          weeklyData,
          sleepData,
          mealDistribution: mealCounts
        });
        
      } catch (error) {
        console.error('Error calculating analytics:', error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, [dateRange]);

  return { analytics, loading };
};

function calculateStreak(logs: FoodLog[]): number {
  if (logs.length === 0) return 0;
  
  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  let currentDate = today;
  
  // Check if there's an entry for today or yesterday (to account for current day)
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  const hasRecentEntry = sortedLogs.some(log => 
    log.date === todayStr || log.date === yesterdayStr
  );
  
  if (!hasRecentEntry) return 0;
  
  // Start from yesterday if no entry today, otherwise start from today
  if (!sortedLogs.some(log => log.date === todayStr)) {
    currentDate = subDays(today, 1);
  }
  
  // Count consecutive days
  for (let i = 0; i < sortedLogs.length; i++) {
    const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd');
    const hasEntry = sortedLogs.some(log => log.date === checkDate);
    
    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateMealDistribution(logs: FoodLog[]): MealDistribution[] {
  const mealCounts: Record<string, number> = {};
  
  logs.forEach(log => {
    // Count meals with content
    if (hasContent(log.breakfast)) mealCounts['Breakfast'] = (mealCounts['Breakfast'] || 0) + 1;
    if (hasContent(log.lunch)) mealCounts['Lunch'] = (mealCounts['Lunch'] || 0) + 1;
    if (hasContent(log.dinner)) mealCounts['Dinner'] = (mealCounts['Dinner'] || 0) + 1;
    if (log.midMorningSnack.snack.trim()) mealCounts['Morning Snack'] = (mealCounts['Morning Snack'] || 0) + 1;
    if (log.midDaySnack.snack.trim()) mealCounts['Afternoon Snack'] = (mealCounts['Afternoon Snack'] || 0) + 1;
    if (log.nighttimeSnack.snack.trim()) mealCounts['Evening Snack'] = (mealCounts['Evening Snack'] || 0) + 1;
  });
  
  return Object.entries(mealCounts)
    .map(([meal, count]) => ({ meal, count }))
    .sort((a, b) => b.count - a.count);
}

function hasContent(mealData: any): boolean {
  if (!mealData) return false;
  
  const fields = ['meatDairy', 'vegetablesFruits', 'breadsCerealsGrains', 'fats', 'candySweets', 'waterIntake', 'otherDrinks'];
  return fields.some(field => mealData[field] && mealData[field].trim() !== '');
}

function generateWeeklyData(logs: FoodLog[], startDate: Date, endDate: Date): WeeklyDataPoint[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLog = logs.find(log => log.date === dayStr);
    
    return {
      date: format(day, 'MMM dd'),
      entries: dayLog ? 1 : 0,
      sleepQuality: dayLog?.sleepQuality || 0,
      waterIntake: parseFloat(dayLog?.dailyWaterIntake || '0')
    };
  });
}