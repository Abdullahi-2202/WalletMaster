import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    email: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardType: text("card_type").notNull(), // visa, mastercard, etc.
  bankName: text("bank_name").notNull(),
  cardNumber: text("card_number").notNull(),
  lastFour: text("last_four").notNull(),
  expiryDate: text("expiry_date").notNull(),
  balance: numeric("balance").notNull(),
  cardColor: text("card_color"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCardSchema = createInsertSchema(cards)
  .pick({
    userId: true,
    cardType: true,
    bankName: true,
    cardNumber: true,
    lastFour: true,
    expiryDate: true,
    balance: true,
    cardColor: true,
    isDefault: true,
  });

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories)
  .pick({
    name: true,
    icon: true,
    color: true,
  });

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardId: integer("card_id").notNull(),
  categoryId: integer("category_id").notNull(),
  merchant: text("merchant").notNull(),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // income, expense
  date: timestamp("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .pick({
    userId: true,
    cardId: true,
    categoryId: true,
    merchant: true,
    amount: true,
    type: true,
    date: true,
    description: true,
  });

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  amount: numeric("amount").notNull(),
  period: text("period").notNull(), // monthly, weekly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets)
  .pick({
    userId: true,
    categoryId: true,
    amount: true,
    period: true,
    startDate: true,
    endDate: true,
  });

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull(),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals)
  .pick({
    userId: true,
    name: true,
    targetAmount: true,
    currentAmount: true,
    targetDate: true,
  });

export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessages)
  .pick({
    userId: true,
    message: true,
    response: true,
  });

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insight: text("insight").notNull(),
  type: text("type").notNull(), // spending, saving, investment
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiInsightSchema = createInsertSchema(aiInsights)
  .pick({
    userId: true,
    insight: true,
    type: true,
    icon: true,
    color: true,
  });

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
