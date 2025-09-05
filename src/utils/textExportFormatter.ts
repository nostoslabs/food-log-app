import { format, parseISO, isValid } from 'date-fns';
import type { FoodLog } from '../types';

export interface TextFormatOptions {
  includeMetadata?: boolean;
  includeHealthMetrics?: boolean;
  separator?: string;
  dateFormat?: string;
  timeFormat?: 'auto' | '12h' | '24h';
}

export class TextExportFormatter {
  private options: Required<TextFormatOptions>;

  constructor(options: TextFormatOptions = {}) {
    this.options = {
      includeMetadata: options.includeMetadata ?? true,
      includeHealthMetrics: options.includeHealthMetrics ?? true,
      separator: options.separator ?? '\n',
      dateFormat: options.dateFormat ?? 'MMM d, yyyy',
      timeFormat: options.timeFormat ?? 'auto'
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, this.options.dateFormat) : dateString;
    } catch {
      return dateString;
    }
  }

  private formatTime(timeString: string): string {
    if (!timeString) return 'Not recorded';
    
    // If it's already formatted or doesn't contain colons, return as-is
    if (!timeString.includes(':')) {
      return timeString;
    }

    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const min = minutes ? parseInt(minutes, 10) : 0;

      if (this.options.timeFormat === '24h') {
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      }

      // Convert to 12-hour format
      if (hour === 0) return `12:${min.toString().padStart(2, '0')} AM`;
      if (hour < 12) return `${hour}:${min.toString().padStart(2, '0')} AM`;
      if (hour === 12) return `12:${min.toString().padStart(2, '0')} PM`;
      return `${hour - 12}:${min.toString().padStart(2, '0')} PM`;
    } catch {
      return timeString;
    }
  }

  private getFoodItems(meal: any): string[] {
    if (!meal) return [];

    return [
      meal.meatDairy || '',
      meal.vegetablesFruits || '',
      meal.breadsCerealsGrains || '',
      meal.fats || '',
      meal.candySweets || '',
      meal.waterIntake || '',
      meal.otherDrinks || ''
    ].filter(item => item && item.trim().length > 0);
  }

  private getSnackItems(snack: any): string[] {
    if (!snack) return [];

    return [
      snack.snack || ''
    ].filter(item => item && item.trim().length > 0);
  }

  formatSingleLog(foodLog: FoodLog): string {
    const lines: string[] = [];

    // Date header
    lines.push(`Date: ${this.formatDate(foodLog.date)}`);
    lines.push('-'.repeat(30));

    // Meals
    const mealTypes = [
      { key: 'breakfast', label: 'Breakfast', defaultTime: '8:00 AM' },
      { key: 'lunch', label: 'Lunch', defaultTime: '12:00 PM' },
      { key: 'dinner', label: 'Dinner', defaultTime: '6:00 PM' }
    ] as const;

    for (const mealType of mealTypes) {
      const meal = foodLog[mealType.key];
      if (meal) {
        const items = this.getFoodItems(meal);
        if (items.length > 0) {
          const time = this.formatTime(meal.time || mealType.defaultTime);
          lines.push(`${mealType.label} (${time})`);
          lines.push(`  ${items.join(', ')}`);
          lines.push('');
        }
      }
    }

    // Snacks
    const snackTypes = [
      { key: 'midMorningSnack', label: 'Mid-Morning Snack', defaultTime: '10:00 AM' },
      { key: 'midDaySnack', label: 'Afternoon Snack', defaultTime: '3:00 PM' },
      { key: 'nighttimeSnack', label: 'Evening Snack', defaultTime: '8:00 PM' }
    ] as const;

    for (const snackType of snackTypes) {
      const snack = foodLog[snackType.key];
      if (snack) {
        const items = this.getSnackItems(snack);
        if (items.length > 0) {
          const time = this.formatTime(snack.time || snackType.defaultTime);
          lines.push(`${snackType.label} (${time})`);
          lines.push(`  ${items.join(', ')}`);
          lines.push('');
        }
      }
    }

    // Health metrics
    if (this.options.includeHealthMetrics) {
      const healthItems: string[] = [];
      
      if (foodLog.bowelMovements) {
        healthItems.push(`Bowel Movements: ${foodLog.bowelMovements}`);
      }
      if (foodLog.exercise) {
        healthItems.push(`Exercise: ${foodLog.exercise}`);
      }
      if (foodLog.dailyWaterIntake) {
        healthItems.push(`Water Intake: ${foodLog.dailyWaterIntake} oz`);
      }
      if (foodLog.sleepQuality) {
        healthItems.push(`Sleep Quality: ${foodLog.sleepQuality}/5`);
      }
      if (foodLog.sleepHours) {
        healthItems.push(`Sleep Hours: ${foodLog.sleepHours}`);
      }
      if (foodLog.notes) {
        healthItems.push(`Notes: ${foodLog.notes}`);
      }

      if (healthItems.length > 0) {
        lines.push('Health Metrics:');
        healthItems.forEach(item => lines.push(`  ${item}`));
        lines.push('');
      }
    }

    return lines.join(this.options.separator);
  }

  formatMultipleLogs(
    foodLogs: FoodLog[], 
    title?: string, 
    dateRange?: { start: string; end: string }
  ): string {
    const lines: string[] = [];

    // Header
    if (title) {
      lines.push(title);
      lines.push('');
    }

    // Date range
    if (dateRange) {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);
      lines.push(`Date Range: ${startDate === endDate ? startDate : `${startDate} - ${endDate}`}`);
    }

    // Metadata
    if (this.options.includeMetadata) {
      lines.push(`Generated on: ${format(new Date(), 'MMM d, yyyy \'at\' h:mm a')}`);
      lines.push(`Total entries: ${foodLogs.length}`);
      lines.push('');
    }

    lines.push('='.repeat(50));
    lines.push('');

    // Process each food log
    foodLogs.forEach((foodLog, index) => {
      lines.push(this.formatSingleLog(foodLog));
      
      // Add separator between logs (except for the last one)
      if (index < foodLogs.length - 1) {
        lines.push('');
        lines.push('='.repeat(50));
        lines.push('');
      }
    });

    return lines.join(this.options.separator);
  }

  // Quick format functions
  formatForEmail(foodLogs: FoodLog[], subject?: string): string {
    return this.formatMultipleLogs(foodLogs, subject);
  }

  formatForPrint(foodLogs: FoodLog[], title?: string): string {
    const formatter = new TextExportFormatter({
      ...this.options,
      separator: '\n',
      includeMetadata: true
    });
    return formatter.formatMultipleLogs(foodLogs, title);
  }

  formatForDoctor(foodLogs: FoodLog[], patientName?: string): string {
    const title = patientName 
      ? `Food & Health Log Report for ${patientName}`
      : 'Food & Health Log Report for Healthcare Provider';
      
    return this.formatMultipleLogs(foodLogs, title);
  }

  // CSV-like format for spreadsheet import
  formatAsCSV(foodLogs: FoodLog[]): string {
    const headers = [
      'Date',
      'Breakfast Time',
      'Breakfast Items',
      'Lunch Time', 
      'Lunch Items',
      'Dinner Time',
      'Dinner Items',
      'Snacks',
      'Water Intake (oz)',
      'Exercise',
      'Sleep Quality',
      'Sleep Hours',
      'Bowel Movements',
      'Notes'
    ];

    const rows = foodLogs.map(log => {
      const breakfastItems = this.getFoodItems(log.breakfast).join('; ');
      const lunchItems = this.getFoodItems(log.lunch).join('; ');
      const dinnerItems = this.getFoodItems(log.dinner).join('; ');
      
      const snacks = [];
      if (log.midMorningSnack && this.getSnackItems(log.midMorningSnack).length > 0) {
        snacks.push(`Morning: ${this.getSnackItems(log.midMorningSnack).join(', ')}`);
      }
      if (log.midDaySnack && this.getSnackItems(log.midDaySnack).length > 0) {
        snacks.push(`Afternoon: ${this.getSnackItems(log.midDaySnack).join(', ')}`);
      }
      if (log.nighttimeSnack && this.getSnackItems(log.nighttimeSnack).length > 0) {
        snacks.push(`Evening: ${this.getSnackItems(log.nighttimeSnack).join(', ')}`);
      }

      return [
        this.formatDate(log.date),
        this.formatTime(log.breakfast?.time || ''),
        breakfastItems,
        this.formatTime(log.lunch?.time || ''),
        lunchItems,
        this.formatTime(log.dinner?.time || ''),
        dinnerItems,
        snacks.join('; '),
        log.dailyWaterIntake || '',
        log.exercise || '',
        log.sleepQuality || '',
        log.sleepHours || '',
        log.bowelMovements || '',
        log.notes?.replace(/[",]/g, ' ') || '' // Clean notes for CSV
      ].map(field => `"${field}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Summary format for quick overview
  formatSummary(foodLogs: FoodLog[]): string {
    const lines: string[] = [];
    
    lines.push('FOOD LOG SUMMARY');
    lines.push('='.repeat(30));
    lines.push(`Period: ${foodLogs.length} days`);
    
    if (foodLogs.length > 0) {
      const firstDate = this.formatDate(foodLogs[0].date);
      const lastDate = this.formatDate(foodLogs[foodLogs.length - 1].date);
      lines.push(`Dates: ${firstDate} to ${lastDate}`);
    }
    
    lines.push('');

    // Count meals and snacks
    let totalMeals = 0;
    let totalSnacks = 0;
    let daysWithExercise = 0;
    let totalWaterIntake = 0;
    let sleepQualitySum = 0;
    let sleepQualityCount = 0;

    foodLogs.forEach(log => {
      // Count meals
      if (log.breakfast && this.getFoodItems(log.breakfast).length > 0) totalMeals++;
      if (log.lunch && this.getFoodItems(log.lunch).length > 0) totalMeals++;
      if (log.dinner && this.getFoodItems(log.dinner).length > 0) totalMeals++;

      // Count snacks
      if (log.midMorningSnack && this.getSnackItems(log.midMorningSnack).length > 0) totalSnacks++;
      if (log.midDaySnack && this.getSnackItems(log.midDaySnack).length > 0) totalSnacks++;
      if (log.nighttimeSnack && this.getSnackItems(log.nighttimeSnack).length > 0) totalSnacks++;

      // Health metrics
      if (log.exercise) daysWithExercise++;
      if (log.dailyWaterIntake) totalWaterIntake += parseInt(log.dailyWaterIntake.toString()) || 0;
      if (log.sleepQuality) {
        sleepQualitySum += parseInt(log.sleepQuality.toString()) || 0;
        sleepQualityCount++;
      }
    });

    lines.push(`Total Meals Logged: ${totalMeals}`);
    lines.push(`Total Snacks Logged: ${totalSnacks}`);
    lines.push(`Days with Exercise: ${daysWithExercise}`);
    lines.push(`Average Daily Water: ${Math.round(totalWaterIntake / Math.max(foodLogs.length, 1))} oz`);
    
    if (sleepQualityCount > 0) {
      const avgSleepQuality = (sleepQualitySum / sleepQualityCount).toFixed(1);
      lines.push(`Average Sleep Quality: ${avgSleepQuality}/5`);
    }

    return lines.join('\n');
  }
}

// Export convenience functions
export const textExportFormatter = new TextExportFormatter();

export const formatForDoctor = (foodLogs: FoodLog[], patientName?: string) => 
  textExportFormatter.formatForDoctor(foodLogs, patientName);

export const formatForEmail = (foodLogs: FoodLog[], subject?: string) => 
  textExportFormatter.formatForEmail(foodLogs, subject);

export const formatAsCSV = (foodLogs: FoodLog[]) => 
  textExportFormatter.formatAsCSV(foodLogs);

export const formatSummary = (foodLogs: FoodLog[]) => 
  textExportFormatter.formatSummary(foodLogs);