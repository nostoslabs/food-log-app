import { Activity, Clock, Coffee, Droplets, Utensils, Zap } from 'lucide-react';

import type { EntryStyle, EntryType } from '../types';

/**
 * Centralized configuration for entry styling - Clean Architecture Presentation Layer
 * Single source of truth for icon types, colors, and styling across Timeline and Log pages
 */
export const ENTRY_STYLES: Record<EntryType, EntryStyle> = {
  breakfast: {
    icon: Coffee,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-yellow-100 text-yellow-600 border-yellow-200',
  },
  lunch: {
    icon: Utensils,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-green-100 text-green-600 border-green-200',
  },
  dinner: {
    icon: Utensils,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-blue-100 text-blue-600 border-blue-200',
  },
  snack: {
    icon: Zap,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-purple-100 text-purple-600 border-purple-200',
  },
  water: {
    icon: Droplets,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-cyan-100 text-cyan-600 border-cyan-200',
  },
  exercise: {
    icon: Zap,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-red-100 text-red-600 border-red-200',
  },
  sleep: {
    icon: Clock,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-indigo-100 text-indigo-600 border-indigo-200',
  },
  health: {
    icon: Activity,
    iconClasses: 'w-5 h-5',
    containerClasses: 'w-12 h-12 rounded-full flex items-center justify-center border-2 bg-red-100 text-red-600 border-red-200',
  },
};

/**
 * Get styling configuration for a specific entry type
 * Pure function - no side effects, framework agnostic
 */
export const getEntryStyle = (type: EntryType): EntryStyle => {
  return ENTRY_STYLES[type];
};

/**
 * For LogPage compact styling - reduced size for card layouts
 */
export const getCompactEntryStyle = (type: EntryType): EntryStyle => {
  const baseStyle = ENTRY_STYLES[type];
  return {
    ...baseStyle,
    iconClasses: 'w-5 h-5',
    containerClasses: baseStyle.containerClasses.replace('w-12 h-12', 'w-10 h-10'),
  };
};