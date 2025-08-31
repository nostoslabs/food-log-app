import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { FoodLog, ApiResponse } from '../types';

export class FirestoreService {
  private readonly COLLECTION_NAME = 'foodLogs';

  // Helper method to convert Firestore timestamps to ISO strings
  private convertTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    return timestamp.toDate?.()?.toISOString() || timestamp;
  }

  // Create a new food log
  async createFoodLog(foodLog: Omit<FoodLog, 'id'>): Promise<ApiResponse<FoodLog>> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...foodLog,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get the created document to return accurate server timestamps
      const createdDoc = await getDoc(docRef);
      const createdData = createdDoc.data();
      
      const createdLog = {
        ...foodLog,
        id: docRef.id,
        createdAt: this.convertTimestamp(createdData?.createdAt),
        updatedAt: this.convertTimestamp(createdData?.updatedAt)
      };

      return {
        success: true,
        data: createdLog,
        message: 'Food log created successfully'
      };
    } catch (error) {
      console.error('Error creating food log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create food log'
      };
    }
  }

  // Get a food log by ID
  async getFoodLog(id: string): Promise<ApiResponse<FoodLog>> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const foodLog: FoodLog = {
          id: docSnap.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as FoodLog;

        return {
          success: true,
          data: foodLog
        };
      } else {
        return {
          success: false,
          error: 'Food log not found'
        };
      }
    } catch (error) {
      console.error('Error getting food log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food log'
      };
    }
  }

  // Get food log by user ID and date
  async getFoodLogByDate(userId: string, date: string): Promise<ApiResponse<FoodLog>> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('date', '==', date),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const foodLog: FoodLog = {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as FoodLog;

        return {
          success: true,
          data: foodLog
        };
      } else {
        return {
          success: false,
          error: 'Food log not found for this date'
        };
      }
    } catch (error) {
      console.error('Error getting food log by date:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food log'
      };
    }
  }

  // Get all food logs for a user
  async getFoodLogs(userId: string, limitCount = 50): Promise<ApiResponse<FoodLog[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const foodLogs: FoodLog[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as FoodLog;
      });

      return {
        success: true,
        data: foodLogs
      };
    } catch (error) {
      console.error('Error getting food logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food logs'
      };
    }
  }

  // Get food logs within a date range
  async getFoodLogsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<FoodLog[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const foodLogs: FoodLog[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as FoodLog;
      });

      return {
        success: true,
        data: foodLogs
      };
    } catch (error) {
      console.error('Error getting food logs by date range:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food logs'
      };
    }
  }

  // Update a food log
  async updateFoodLog(id: string, updates: Partial<FoodLog>): Promise<ApiResponse<FoodLog>> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Get the updated document
      const result = await this.getFoodLog(id);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Food log updated successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to retrieve updated food log'
        };
      }
    } catch (error) {
      console.error('Error updating food log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update food log'
      };
    }
  }

  // Delete a food log
  async deleteFoodLog(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Food log deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting food log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete food log'
      };
    }
  }

  // Create or update food log (upsert)
  async upsertFoodLog(foodLog: FoodLog): Promise<ApiResponse<FoodLog>> {
    if (foodLog.id) {
      // Update existing
      const { id, ...updates } = foodLog;
      return this.updateFoodLog(id, updates);
    } else {
      // Create new
      const { id, ...newLog } = foodLog;
      return this.createFoodLog(newLog);
    }
  }
}

// Export a singleton instance
export const firestoreService = new FirestoreService();