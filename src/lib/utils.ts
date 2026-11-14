import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple CSS class names or conditional class objects into a single
 * optimized class string, resolving any Tailwind CSS class collisions using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric score (0-100) as an integer percentage string.
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * Capitalizes the first letter of a proficiency level or status string.
 */
export function formatProficiency(level: string): string {
  if (!level) return '';
  return level.charAt(0).toUpperCase() + level.slice(1);
}
