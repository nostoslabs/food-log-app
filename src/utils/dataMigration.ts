/**
 * CRITICAL: Data Migration Utilities for Health Data Integrity
 * 
 * This module handles migration of legacy sleep data from 1-5 scale to 0-100 percentage scale.
 * Essential for maintaining data integrity in healthcare applications.
 */

import { firestoreService } from '../services/firestore';
import type { FoodLog } from '../types';

/**
 * Convert old sleep quality rating (1-5) to percentage (0-100)
 */
export function convertSleepQualityToPercentage(oldRating: number): number {
  if (oldRating <= 0) return 0;
  if (oldRating > 100) return oldRating; // Already percentage
  if (oldRating <= 5) {
    // Convert 1-5 scale to percentage (1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
    return Math.min(100, oldRating * 20);
  }
  return oldRating; // Assume already percentage
}

/**
 * Migrate a single FoodLog's sleep data to new percentage format
 */
export function migrateFoodLogSleepData(foodLog: FoodLog): { 
  updated: boolean; 
  originalQuality: number; 
  newQuality: number; 
} {
  const originalQuality = foodLog.sleepQuality || 0;
  
  if (originalQuality > 0 && originalQuality <= 5) {
    const newQuality = convertSleepQualityToPercentage(originalQuality);
    foodLog.sleepQuality = newQuality;
    
    console.warn(`[DATA MIGRATION] Sleep quality updated: ${originalQuality}/5 → ${newQuality}%`);
    return { 
      updated: true, 
      originalQuality, 
      newQuality 
    };
  }
  
  return { 
    updated: false, 
    originalQuality, 
    newQuality: originalQuality 
  };
}

/**
 * Clean up localStorage sleep data for current user
 */
export function migrateLocalStorageSleepData(): { 
  migratedCount: number; 
  totalChecked: number; 
} {
  let migratedCount = 0;
  let totalChecked = 0;
  
  try {
    // Check all localStorage food log entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('foodLog_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const foodLog = JSON.parse(stored);
            totalChecked++;
            
            const migration = migrateFoodLogSleepData(foodLog);
            if (migration.updated) {
              // Update localStorage with migrated data
              foodLog.updatedAt = new Date().toISOString();
              localStorage.setItem(key, JSON.stringify(foodLog));
              migratedCount++;
              
              console.log(`[DATA MIGRATION] Updated localStorage entry: ${key}`);
            }
          } catch (parseError) {
            console.error(`[DATA MIGRATION] Failed to parse localStorage entry ${key}:`, parseError);
          }
        }
      }
    }
    
    if (migratedCount > 0) {
      console.log(`[DATA MIGRATION] Successfully migrated ${migratedCount}/${totalChecked} localStorage entries`);
    }
    
    return { migratedCount, totalChecked };
  } catch (error) {
    console.error('[DATA MIGRATION] Error during localStorage migration:', error);
    return { migratedCount: 0, totalChecked: 0 };
  }
}

/**
 * ALPHA TESTING: Clear all Firestore sleep data for a user
 * WARNING: This permanently deletes data - only use in alpha testing!
 */
export async function clearFirestoreSleepDataAlpha(userId: string): Promise<{
  success: boolean;
  clearedCount: number;
  error?: string;
}> {
  if (!userId) {
    return { success: false, clearedCount: 0, error: 'No user ID provided' };
  }
  
  try {
    console.warn(`[ALPHA CLEANUP] Starting Firestore sleep data cleanup for user: ${userId}`);
    
    // Get all food logs for the user
    const result = await firestoreService.getFoodLogs(userId, 100); // Get up to 100 entries
    
    if (!result.success || !result.data) {
      return { success: false, clearedCount: 0, error: result.error || 'Failed to fetch food logs' };
    }
    
    let clearedCount = 0;
    
    for (const foodLog of result.data) {
      if (foodLog.sleepQuality > 0 || foodLog.sleepHours) {
        // Clear sleep data
        const updateResult = await firestoreService.updateFoodLog(foodLog.id!, {
          sleepQuality: 0,
          sleepHours: ''
        });
        
        if (updateResult.success) {
          clearedCount++;
          console.log(`[ALPHA CLEANUP] Cleared sleep data for date: ${foodLog.date}`);
        } else {
          console.error(`[ALPHA CLEANUP] Failed to clear sleep data for ${foodLog.date}:`, updateResult.error);
        }
      }
    }
    
    console.log(`[ALPHA CLEANUP] Completed: cleared ${clearedCount} Firestore entries`);
    return { success: true, clearedCount };
    
  } catch (error) {
    console.error('[ALPHA CLEANUP] Error during Firestore cleanup:', error);
    return { 
      success: false, 
      clearedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Sync all localStorage data to Firestore when user authenticates
 */
export async function syncLocalStorageToFirestore(userId: string): Promise<{
  syncedCount: number;
  totalFound: number;
  errors: string[];
}> {
  console.log('[DATA SYNC] Starting localStorage to Firestore sync for user:', userId);
  
  let syncedCount = 0;
  let totalFound = 0;
  const errors: string[] = [];
  
  try {
    // Scan all localStorage for food logs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('foodLog_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            totalFound++;
            const foodLog = JSON.parse(stored);
            
            // Ensure the log has the userId
            const logWithUser = { ...foodLog, userId };
            
            // Sync to Firestore
            const result = await firestoreService.upsertFoodLog(logWithUser);
            if (result.success) {
              syncedCount++;
              console.log(`[DATA SYNC] Synced ${foodLog.date} to Firestore`);
            } else {
              errors.push(`Failed to sync ${foodLog.date}: ${result.error}`);
            }
            
          } catch (parseError) {
            errors.push(`Failed to parse localStorage entry ${key}: ${parseError}`);
          }
        }
      }
    }
    
    console.log(`[DATA SYNC] Sync completed: ${syncedCount}/${totalFound} entries synced`);
    return { syncedCount, totalFound, errors };
    
  } catch (error) {
    console.error('[DATA SYNC] Error during localStorage sync:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    return { syncedCount, totalFound, errors };
  }
}

/**
 * Comprehensive alpha data cleanup and migration
 * NOTE: This is for alpha cleanup only, not regular authentication
 */
export async function performAlphaDataMigration(userId?: string): Promise<{
  localStorageMigration: { migratedCount: number; totalChecked: number };
  firestoreCleanup?: { success: boolean; clearedCount: number; error?: string };
}> {
  console.log('[ALPHA MIGRATION] Starting comprehensive data migration...');
  
  // Always migrate localStorage
  const localStorageMigration = migrateLocalStorageSleepData();
  
  const result: any = { localStorageMigration };
  
  // Clear Firestore if user is authenticated
  if (userId) {
    console.log('[ALPHA MIGRATION] User authenticated, clearing Firestore sleep data...');
    result.firestoreCleanup = await clearFirestoreSleepDataAlpha(userId);
  }
  
  console.log('[ALPHA MIGRATION] Migration completed:', result);
  return result;
}