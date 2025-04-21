import { users, type User, type InsertUser, cards, type Card, type InsertCard, categories, type Category, type InsertCategory, transactions, type Transaction, type InsertTransaction, budgets, type Budget, type InsertBudget, savingsGoals, type SavingsGoal, type InsertSavingsGoal, aiMessages, type AiMessage, type InsertAiMessage, aiInsights, type AiInsight, type InsertAiInsight } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Card methods
  getCard(id: number): Promise<Card | undefined>;
  getCardsByUserId(userId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<Card>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;

  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Budget methods
  getBudget(id: number): Promise<Budget | undefined>;
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Savings Goal methods
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<SavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;

  // AI Message methods
  getAiMessagesByUserId(userId: number, limit?: number): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;

  // AI Insight methods
  getAiInsightsByUserId(userId: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cards: Map<number, Card>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private aiMessages: Map<number, AiMessage>;
  private aiInsights: Map<number, AiInsight>;
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentCardId: number;
  currentCategoryId: number;
  currentTransactionId: number;
  currentBudgetId: number;
  currentSavingsGoalId: number;
  currentAiMessageId: number;
  currentAiInsightId: number;

  constructor() {
    this.users = new Map();
    this.cards = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.aiMessages = new Map();
    this.aiInsights = new Map();
    
    this.currentUserId = 1;
    this.currentCardId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    this.currentBudgetId = 1;
    this.currentSavingsGoalId = 1;
    this.currentAiMessageId = 1;
    this.currentAiInsightId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  // Initialize default categories
  private async initializeDefaultCategories() {
    const defaultCategories = [
      { name: 'Food & Dining', icon: 'utensils', color: '#3B82F6' },
      { name: 'Housing', icon: 'home', color: '#10B981' },
      { name: 'Transportation', icon: 'car', color: '#6366F1' },
      { name: 'Shopping', icon: 'shopping-bag', color: '#F59E0B' },
      { name: 'Entertainment', icon: 'film', color: '#EC4899' },
      { name: 'Health & Fitness', icon: 'heartbeat', color: '#EF4444' },
      { name: 'Personal Care', icon: 'bath', color: '#8B5CF6' },
      { name: 'Education', icon: 'graduation-cap', color: '#14B8A6' },
      { name: 'Gifts & Donations', icon: 'gift', color: '#F97316' },
      { name: 'Bills & Utilities', icon: 'file-invoice-dollar', color: '#6B7280' },
      { name: 'Travel', icon: 'plane', color: '#06B6D4' },
      { name: 'Other', icon: 'ellipsis-h', color: '#9CA3AF' }
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, profileImage: null, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Card methods
  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async getCardsByUserId(userId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.userId === userId,
    );
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.currentCardId++;
    const now = new Date();
    const card: Card = { ...insertCard, id, createdAt: now };
    this.cards.set(id, card);
    return card;
  }

  async updateCard(id: number, updateData: Partial<Card>): Promise<Card | undefined> {
    const card = await this.getCard(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...updateData };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    return this.cards.delete(id);
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const now = new Date();
    const category: Category = { ...insertCategory, id, createdAt: now };
    this.categories.set(id, category);
    return category;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt: now };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Budget methods
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId,
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const now = new Date();
    const budget: Budget = { ...insertBudget, id, createdAt: now };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updateData: Partial<Budget>): Promise<Budget | undefined> {
    const budget = await this.getBudget(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...updateData };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Savings Goal methods
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }

  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentSavingsGoalId++;
    const now = new Date();
    const goal: SavingsGoal = { ...insertGoal, id, createdAt: now };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async updateSavingsGoal(id: number, updateData: Partial<SavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateData };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteSavingsGoal(id: number): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }

  // AI Message methods
  async getAiMessagesByUserId(userId: number, limit?: number): Promise<AiMessage[]> {
    const userMessages = Array.from(this.aiMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userMessages.slice(0, limit) : userMessages;
  }

  async createAiMessage(insertMessage: InsertAiMessage): Promise<AiMessage> {
    const id = this.currentAiMessageId++;
    const now = new Date();
    const message: AiMessage = { ...insertMessage, id, timestamp: now };
    this.aiMessages.set(id, message);
    return message;
  }

  // AI Insight methods
  async getAiInsightsByUserId(userId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.userId === userId,
    );
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.currentAiInsightId++;
    const now = new Date();
    const insight: AiInsight = { ...insertInsight, id, createdAt: now };
    this.aiInsights.set(id, insight);
    return insight;
  }
}

export const storage = new MemStorage();
