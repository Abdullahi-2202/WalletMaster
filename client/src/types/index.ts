// Card types
export interface CardType {
  id: number;
  userId: number;
  cardType: string;
  bankName: string;
  cardNumber: string;
  lastFour: string;
  expiryDate: string;
  balance: number;
  cardColor?: string;
  isDefault: boolean;
  createdAt: Date;
}

// Category types
export interface CategoryType {
  id: number;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
}

// Transaction types
export interface TransactionType {
  id: number;
  userId: number;
  cardId: number;
  categoryId: number;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  description?: string;
  createdAt: Date;
  
  // Join data
  category?: CategoryType;
  card?: CardType;
}

// Budget types
export interface BudgetType {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  
  // Join data
  category?: CategoryType;
  spent?: number;
  percentage?: number;
}

// Savings Goal types
export interface SavingsGoalType {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  createdAt: Date;
  percentage?: number;
}

// AI Message types
export interface AiMessageType {
  id: number;
  userId: number;
  message: string;
  response: string;
  timestamp: Date;
}

// AI Insight types
export interface AiInsightType {
  id: number;
  userId: number;
  insight: string;
  type: 'spending' | 'saving' | 'investment';
  icon: string;
  color: string;
  createdAt: Date;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

// Modal types
export type ModalType = 'addCard' | 'addBudget' | 'addSavingsGoal' | 'chatbot' | null;
