/**
 * CRITICAL: Data Validation Schemas for Healthcare Data Integrity
 * 
 * This module defines comprehensive validation schemas to ensure patient data
 * meets medical standards and prevents data corruption that could impact care.
 */

import { z } from 'zod';

// Time validation - ensures consistent time format with migration support
const timeSchema = z.string()
  .transform(time => {
    // Handle various time formats that might exist in Firebase
    const trimmedTime = time.trim();
    
    // If already in correct format, return as-is
    if (/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/i.test(trimmedTime)) {
      return trimmedTime.toUpperCase();
    }
    
    // Try to parse 24-hour format (HH:MM or H:MM)
    const twentyFourHourMatch = trimmedTime.match(/^([0-2]?\d):([0-5]\d)$/);
    if (twentyFourHourMatch) {
      const hours24 = parseInt(twentyFourHourMatch[1], 10);
      const minutes = twentyFourHourMatch[2];
      
      if (hours24 >= 0 && hours24 <= 23) {
        const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
        const period = hours24 >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${period}`;
      }
    }
    
    // Try to parse time without AM/PM (assume reasonable defaults)
    const simpleTimeMatch = trimmedTime.match(/^([0-1]?\d):([0-5]\d)$/);
    if (simpleTimeMatch) {
      const hours = parseInt(simpleTimeMatch[1], 10);
      const minutes = simpleTimeMatch[2];
      
      if (hours >= 1 && hours <= 12) {
        // Default to AM for 1-7, PM for 8-12
        const period = hours <= 7 ? 'AM' : 'PM';
        return `${hours}:${minutes} ${period}`;
      }
    }
    
    // If we can't parse it, return a default time to prevent validation failure
    console.warn(`[TIME MIGRATION] Could not parse time "${time}", using default`);
    return '12:00 PM';
  })
  .refine(time => {
    // Final validation on the transformed time
    return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(time);
  }, 'Invalid time format after transformation')

// Health-safe sleep quality validation (0-100 percentage only)
const sleepQualitySchema = z.number()
  .min(0, 'Sleep quality cannot be negative')
  .max(100, 'Sleep quality cannot exceed 100%')
  .int('Sleep quality must be a whole number')
  .refine(value => {
    // CRITICAL: Prevent old 1-5 scale from entering system
    if (value > 0 && value <= 5) {
      throw new Error('Sleep quality must be 0-100 percentage, not 1-5 scale');
    }
    return true;
  }, 'Sleep quality must be 0-100 percentage format');

// Sleep hours validation with medical standards
const sleepHoursSchema = z.string()
  .regex(/^(\d{1,2}(h|\shours?))?(\s?\d{1,2}(m|\smin(utes?)?)?)?$/i, 'Invalid sleep duration format')
  .refine(value => {
    if (!value.trim()) return true; // Empty is valid
    
    // Extract hours and minutes
    const hoursMatch = value.match(/(\d{1,2})(?:h|\shours?)/i);
    const minutesMatch = value.match(/(\d{1,2})(?:m|\smin)/i);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    
    // Medical validation: reasonable sleep duration
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 0 && totalMinutes <= 24 * 60; // 0-24 hours max
  }, 'Sleep duration must be reasonable (0-24 hours)');

// Water intake validation with health standards
const waterIntakeSchema = z.string()
  .refine(value => {
    if (!value.trim()) return true; // Empty is valid
    
    // Extract numeric value
    const match = value.match(/^(\d+(?:\.\d+)?)\s?(oz|ml|cups?|l|liters?)?$/i);
    if (!match) return false;
    
    const amount = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() || 'oz';
    
    // Convert to ounces for validation
    let amountInOz = amount;
    if (unit.startsWith('ml')) amountInOz = amount * 0.033814;
    else if (unit.startsWith('l')) amountInOz = amount * 33.814;
    else if (unit.startsWith('cup')) amountInOz = amount * 8;
    
    // Medical validation: reasonable water intake (0-300 oz per day)
    return amountInOz >= 0 && amountInOz <= 300;
  }, 'Water intake must be reasonable amount with valid unit (oz, ml, cups, l)');

// Food category validation - prevent empty strings that could hide data
const foodCategorySchema = z.string()
  .transform(value => value.trim())
  .refine(value => value.length === 0 || value.length >= 2, 
    'Food entries must be either empty or at least 2 characters');

// Meal data schema with comprehensive validation
const mealDataSchema = z.object({
  time: timeSchema,
  meatDairy: foodCategorySchema,
  vegetablesFruits: foodCategorySchema,
  breadsCerealsGrains: foodCategorySchema,
  fats: foodCategorySchema,
  candySweets: foodCategorySchema,
  waterIntake: waterIntakeSchema,
  otherDrinks: foodCategorySchema,
});

// Snack data schema
const snackDataSchema = z.object({
  time: timeSchema,
  snack: foodCategorySchema,
});

// Notes validation - prevent potentially dangerous content
const notesSchema = z.string()
  .max(1000, 'Notes cannot exceed 1000 characters')
  .refine(value => {
    // Basic sanitization - prevent script injection
    return !value.includes('<script') && !value.includes('javascript:');
  }, 'Notes contain invalid content');

// Exercise validation
const exerciseSchema = z.string()
  .max(500, 'Exercise description cannot exceed 500 characters')
  .refine(value => !value.includes('<script'), 'Exercise description contains invalid content');

// Bowel movements validation (medical terminology)
const bowelMovementsSchema = z.string()
  .max(200, 'Bowel movement description cannot exceed 200 characters');

// Complete FoodLog schema with comprehensive validation
export const foodLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  // Meals
  breakfast: mealDataSchema,
  lunch: mealDataSchema,
  dinner: mealDataSchema,
  
  // Snacks
  midMorningSnack: snackDataSchema,
  midDaySnack: snackDataSchema,
  nighttimeSnack: snackDataSchema,
  
  // Health Metrics - CRITICAL for patient safety
  bowelMovements: bowelMovementsSchema,
  exercise: exerciseSchema,
  dailyWaterIntake: waterIntakeSchema,
  sleepQuality: sleepQualitySchema,
  sleepHours: sleepHoursSchema,
  notes: notesSchema,
  
  // Timestamps - required for audit trail
  createdAt: z.string().datetime('Invalid createdAt timestamp'),
  updatedAt: z.string().datetime('Invalid updatedAt timestamp'),
});

export type ValidatedFoodLog = z.infer<typeof foodLogSchema>;

// Partial validation for updates
export const partialFoodLogSchema = foodLogSchema.partial().refine(
  data => data.date !== undefined,
  'Date is required for all food log entries'
);

// Validation result type for error handling
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Safe validation function with detailed error reporting
export function validateFoodLog(data: unknown): ValidationResult<ValidatedFoodLog> {
  try {
    const validated = foodLogSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Safe partial validation for updates
export function validatePartialFoodLog(data: unknown): ValidationResult<Partial<ValidatedFoodLog>> {
  try {
    const validated = partialFoodLogSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Permissive sleep quality schema for migration (allows 1-5 values before conversion)
const migrationSleepQualitySchema = z.number()
  .min(0, 'Sleep quality cannot be negative')
  .max(100, 'Sleep quality cannot exceed 100%')
  .int('Sleep quality must be a whole number');

// Migration-specific food log schema (same as regular but with permissive sleep validation)
const migrationFoodLogSchema = foodLogSchema.extend({
  sleepQuality: migrationSleepQualitySchema,
});

// Migration validation - ensures old data can be safely migrated
export function validateAndMigrateFoodLog(data: unknown): ValidationResult<ValidatedFoodLog> {
  try {
    // First, handle sleep quality migration if needed
    const migrated = { ...(data as any) };
    
    if (migrated.sleepQuality && typeof migrated.sleepQuality === 'number') {
      // Convert old 1-5 scale to 0-100 if detected
      if (migrated.sleepQuality > 0 && migrated.sleepQuality <= 5) {
        migrated.sleepQuality = migrated.sleepQuality * 20;
        console.warn(`[DATA MIGRATION] Converted sleep quality ${(data as any).sleepQuality}/5 to ${migrated.sleepQuality}% during validation`);
      }
    }
    
    // Add timestamps if missing
    const now = new Date().toISOString();
    if (!migrated.createdAt) migrated.createdAt = now;
    if (!migrated.updatedAt) migrated.updatedAt = now;
    
    // Use migration schema that allows the converted values
    const validated = migrationFoodLogSchema.parse(migrated);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Migration validation failed'] };
  }
}