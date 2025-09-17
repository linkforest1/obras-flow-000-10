import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { sanitizeInput } from "@/utils/security"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe string formatting for display
 */
export function safeString(input: unknown): string {
  if (typeof input === 'string') {
    return sanitizeInput(input);
  }
  if (input === null || input === undefined) {
    return '';
  }
  return sanitizeInput(String(input));
}
