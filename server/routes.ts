import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCardSchema, insertBudgetSchema, insertSavingsGoalSchema, insertAiMessageSchema, insertTransactionSchema } from "@shared/schema";
import { getFinancialAdvice, generateFinancialInsights, analyzeSpendingPatterns } from "./openai";
import { paymentRegistry } from "./payment-registry";

// Auth middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Cards API
  app.get("/api/cards", isAuthenticated, async (req, res) => {
    try {
      const cards = await storage.getCardsByUserId(req.user!.id);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post("/api/cards", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCardSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const card = await storage.createCard(validatedData);
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create card" });
    }
  });

  app.put("/api/cards/:id", isAuthenticated, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await storage.getCard(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedCard = await storage.updateCard(cardId, req.body);
      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to update card" });
    }
  });

  app.delete("/api/cards/:id", isAuthenticated, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await storage.getCard(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCard(cardId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete card" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Transactions API
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      let limit: number | undefined;
      if (req.query.limit && typeof req.query.limit === 'string') {
        limit = parseInt(req.query.limit);
      }
      
      const transactions = await storage.getTransactionsByUserId(req.user!.id, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Budgets API
  app.get("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const budgets = await storage.getBudgetsByUserId(req.user!.id);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const budget = await storage.getBudget(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBudget = await storage.updateBudget(budgetId, req.body);
      res.json(updatedBudget);
    } catch (error) {
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const budget = await storage.getBudget(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBudget(budgetId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Savings Goals API
  app.get("/api/savings-goals", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getSavingsGoalsByUserId(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSavingsGoalSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const goal = await storage.createSavingsGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create savings goal" });
    }
  });

  app.put("/api/savings-goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getSavingsGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedGoal = await storage.updateSavingsGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update savings goal" });
    }
  });

  app.delete("/api/savings-goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getSavingsGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteSavingsGoal(goalId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings goal" });
    }
  });

  // AI Chatbot API
  app.post("/api/ai/chat", isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get user data for context
      const userData = {
        transactions: await storage.getTransactionsByUserId(req.user!.id, 20),
        budgets: await storage.getBudgetsByUserId(req.user!.id),
        savingsGoals: await storage.getSavingsGoalsByUserId(req.user!.id),
      };

      // Get AI response
      const response = await getFinancialAdvice(message, userData);
      
      // Save the message and response
      await storage.createAiMessage({
        userId: req.user!.id,
        message,
        response
      });

      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  // AI Insights API
  app.get("/api/ai/insights", isAuthenticated, async (req, res) => {
    try {
      // First check if there are already insights
      const existingInsights = await storage.getAiInsightsByUserId(req.user!.id);
      
      if (existingInsights.length > 0) {
        return res.json(existingInsights);
      }

      // Get user data for generating insights
      const userData = {
        transactions: await storage.getTransactionsByUserId(req.user!.id),
        budgets: await storage.getBudgetsByUserId(req.user!.id),
        savingsGoals: await storage.getSavingsGoalsByUserId(req.user!.id),
      };

      // Generate insights
      const { insights } = await generateFinancialInsights(userData);
      
      // Save and return insights
      const savedInsights = [];
      for (const insight of insights) {
        const savedInsight = await storage.createAiInsight({
          userId: req.user!.id,
          insight: insight.text,
          type: insight.type,
          icon: insight.icon,
          color: insight.color
        });
        savedInsights.push(savedInsight);
      }

      res.json(savedInsights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Spending analysis API
  app.get("/api/ai/spending-analysis", isAuthenticated, async (req, res) => {
    try {
      // Get user transactions
      const transactions = await storage.getTransactionsByUserId(req.user!.id);
      
      // Analyze spending patterns
      const { recommendations } = await analyzeSpendingPatterns({ 
        transactions,
        userId: req.user!.id
      });

      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze spending patterns" });
    }
  });
  
  // Find user by email (for transfers)
  app.get("/api/users/find", isAuthenticated, async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email parameter is required" });
      }
      
      // Don't allow transferring to yourself
      if (req.user!.email === email) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return limited user info for security
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to find user" });
    }
  });
  
  // Payment routes
  
  // Create a payment intent (for front-end Stripe Elements)
  app.post("/api/payments/create-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, currency = 'usd', metadata = {}, paymentMethodTypes = ['card'] } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Add user ID to metadata for reference
      metadata.userId = req.user!.id.toString();
      
      const result = await paymentRegistry.createPaymentIntent(amount, currency, metadata);
      
      res.json({
        clientSecret: result.clientSecret,
        id: result.id,
        status: result.status
      });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });
  
  // Add funds to card
  app.post("/api/payments/add-funds", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { cardId, amount, paymentMethodId } = req.body;
      
      if (!cardId || !amount || amount <= 0 || !paymentMethodId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get the card
      const card = await storage.getCard(parseInt(cardId));
      
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Create payment intent and confirm it immediately
      const metadata = {
        userId: userId.toString(),
        cardId: cardId.toString(),
        description: `Add funds to card ending in ${card.lastFour}`
      };
      
      const paymentIntent = await paymentRegistry.createPaymentIntent(
        amount, 
        'usd',
        metadata
      );
      
      // Process the payment
      const paymentResult = await paymentRegistry.processPayment(
        paymentIntent.id,
        paymentMethodId
      );
      
      if (!paymentResult.success) {
        return res.status(400).json({ 
          message: "Payment failed", 
          error: paymentResult.error 
        });
      }
      
      // Update card balance with string value
      const updatedCard = await storage.updateCard(parseInt(cardId), {
        balance: (Number(card.balance) + Number(amount)).toString()
      });
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        userId,
        cardId: parseInt(cardId),
        categoryId: 1, // Income category
        amount,
        type: 'income',
        merchant: 'Wallet Master',
        description: 'Add funds to card',
        date: new Date(),
      });
      
      res.json({
        success: true,
        card: updatedCard,
        transaction
      });
    } catch (error: any) {
      console.error("Add funds error:", error);
      res.status(500).json({ message: error.message || "Failed to add funds" });
    }
  });
  
  // Pay utility bill
  app.post("/api/payments/pay-utility", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { cardId, amount, utilityName, utilityCategory, description } = req.body;
      
      if (!cardId || !amount || amount <= 0 || !utilityName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get the card
      const card = await storage.getCard(parseInt(cardId));
      
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Check if card has sufficient balance
      if (Number(card.balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Create payment metadata
      const metadata = {
        userId: userId.toString(),
        cardId: cardId.toString(),
        utilityName,
        type: 'utility_bill'
      };
      
      // Create payment intent for utility bill
      const paymentIntent = await paymentRegistry.createPaymentIntent(
        amount,
        'usd',
        metadata
      );
      
      // Update card balance - convert to string to match schema
      const updatedCard = await storage.updateCard(parseInt(cardId), {
        balance: (Number(card.balance) - Number(amount)).toString()
      });
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        userId,
        cardId: parseInt(cardId),
        categoryId: utilityCategory || 2, // Default to "Bills" category if not specified
        amount,
        type: 'expense',
        merchant: utilityName,
        description: description || `Payment for ${utilityName}`,
        date: new Date(),
        stripePaymentId: paymentIntent.id
      });
      
      res.json({
        success: true,
        card: updatedCard,
        transaction,
        paymentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Pay utility error:", error);
      res.status(500).json({ message: error.message || "Failed to pay utility bill" });
    }
  });
  
  // Transfer money to another user
  app.post("/api/payments/transfer", isAuthenticated, async (req, res) => {
    try {
      const senderId = req.user!.id;
      const { recipientId, cardId, amount, description } = req.body;
      
      if (!recipientId || !cardId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get the sender's card
      const card = await storage.getCard(parseInt(cardId));
      
      if (!card || card.userId !== senderId) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Check if card has sufficient balance
      if (Number(card.balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Get the recipient
      const recipient = await storage.getUser(parseInt(recipientId));
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Create payment metadata for the transfer
      const metadata = {
        senderId: senderId.toString(),
        recipientId: recipientId.toString(),
        cardId: cardId.toString(),
        transferType: 'user_to_user',
      };
      
      // Create payment intent for the transfer
      const paymentIntent = await paymentRegistry.createPaymentIntent(
        amount,
        'usd',
        metadata
      );
      
      // Update sender's card balance (convert to string to match schema)
      const updatedSenderCard = await storage.updateCard(parseInt(cardId), {
        balance: (Number(card.balance) - Number(amount)).toString()
      });
      
      // Get recipient's default card
      const recipientCards = await storage.getCardsByUserId(parseInt(recipientId));
      const defaultCard = recipientCards.find(card => card.isDefault) || recipientCards[0];
      
      if (!defaultCard) {
        return res.status(404).json({ message: "Recipient has no cards" });
      }
      
      // Update recipient's card balance (convert to string to match schema)
      const updatedRecipientCard = await storage.updateCard(defaultCard.id, {
        balance: (Number(defaultCard.balance) + Number(amount)).toString()
      });
      
      // Create sender's transaction record (expense)
      const senderTransaction = await storage.createTransaction({
        userId: senderId,
        cardId: parseInt(cardId),
        categoryId: 3, // Transfer category
        amount,
        type: 'expense',
        merchant: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
        description: description || 'Money transfer',
        date: new Date(),
        stripePaymentId: paymentIntent.id
      });
      
      // Create recipient's transaction record (income)
      const recipientTransaction = await storage.createTransaction({
        userId: parseInt(recipientId),
        cardId: defaultCard.id,
        categoryId: 3, // Transfer category
        amount,
        type: 'income',
        merchant: `Transfer from ${req.user!.firstName} ${req.user!.lastName}`,
        description: description || 'Money transfer',
        date: new Date(),
        stripePaymentId: paymentIntent.id
      });
      
      res.json({
        success: true,
        senderCard: updatedSenderCard,
        recipientCard: updatedRecipientCard,
        senderTransaction,
        recipientTransaction,
        paymentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Transfer error:", error);
      res.status(500).json({ message: error.message || "Failed to transfer money" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
