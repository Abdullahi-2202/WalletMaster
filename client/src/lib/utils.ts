import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getCardGradient(color: string): string {
  const gradientMap: Record<string, string> = {
    blue: 'from-primary to-accent',
    green: 'from-secondary to-teal-400',
    purple: 'from-violet-500 to-purple-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
    pink: 'from-pink-500 to-rose-400',
  };
  
  return gradientMap[color] || 'from-gray-700 to-gray-900';
}

export function getCategoryIcon(iconName: string): string {
  return iconName || 'question-circle';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(now);
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

export function getProgressColor(percentage: number): string {
  if (percentage > 100) return 'bg-danger';
  if (percentage > 90) return 'bg-warning';
  return 'bg-primary';
}

export function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getDaysRemaining(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getCardType(type: string): string {
  const typeMap: Record<string, string> = {
    visa: 'fa-cc-visa',
    mastercard: 'fa-cc-mastercard',
    amex: 'fa-cc-amex',
    discover: 'fa-cc-discover',
  };
  
  return typeMap[type.toLowerCase()] || 'fa-credit-card';
}
