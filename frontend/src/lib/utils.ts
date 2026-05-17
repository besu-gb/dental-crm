// src/lib/utils.ts
// shadcn/ui utility — merges Tailwind class names safely.
// tailwind-merge v3 works the same way but is faster and smaller.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string nicely: "Jan 5, 2025"
export function formatDate(dateStr?: string | Date) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format currency — adjust locale/currency code for your country
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB", // Ethiopian Birr — change to your currency e.g. "USD", "EUR"
  }).format(amount);
}
