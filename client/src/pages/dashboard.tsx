import { useEffect, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentMonthYear } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { BalanceSummary } from "@/components/dashboard/balance-summary";
import { LinkedCards } from "@/components/dashboard/linked-cards";
import { BudgetTracker } from "@/components/dashboard/budget-tracker";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsGoals } from "@/components/dashboard/savings-goals";
import { MonthlySpending } from "@/components/dashboard/monthly-spending";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { ChatbotModal } from "@/components/chatbot/chatbot-modal";
import { AddCardModal } from "@/components/forms/add-card-modal";
import { AddBudgetModal } from "@/components/forms/add-budget-modal";
import { AddSavingsGoalModal } from "@/components/forms/add-savings-goal-modal";
import { ModalContext } from "@/App";
import { queryClient } from "@/lib/queryClient";
import { CardType, BudgetType, CategoryType, TransactionType, SavingsGoalType, AiInsightType } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeModal } = useContext(ModalContext);
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  
  // Fetch cards
  const { data: cards = [], isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<CategoryType[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionType[]>({
    queryKey: ["/api/transactions", {limit: 5}],
  });
  
  // Fetch budgets
  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery<BudgetType[]>({
    queryKey: ["/api/budgets"],
  });
  
  // Fetch savings goals
  const { data: savingsGoals = [], isLoading: isLoadingSavingsGoals } = useQuery<SavingsGoalType[]>({
    queryKey: ["/api/savings-goals"],
  });
  
  // Fetch AI insights
  const { data: aiInsights = [], isLoading: isLoadingInsights, refetch: refetchInsights } = useQuery<AiInsightType[]>({
    queryKey: ["/api/ai/insights"],
  });

  // Calculate summary values
  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance), 0);
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Mock data for visualizations (in a real app this would come from the API)
  const incomeChange = 5.1;
  const expenseChange = 2.4;

  // Calculate spending for each budget
  const budgetsWithSpending = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const percentage = (spent / Number(budget.amount)) * 100;
    
    return {
      ...budget,
      spent,
      percentage
    };
  });

  // Calculate percentage for each savings goal
  const savingsGoalsWithPercentage = savingsGoals.map(goal => {
    const percentage = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
    
    return {
      ...goal,
      percentage
    };
  });

  // Handle refreshing insights
  const handleRefreshInsights = async () => {
    if (refreshingInsights) return;
    
    setRefreshingInsights(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/ai/insights"] });
      await refetchInsights();
    } finally {
      setRefreshingInsights(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-600">Your financial summary for {getCurrentMonthYear()}</p>
          </div>

          {/* Account Balance Summary */}
          <BalanceSummary 
            totalBalance={totalBalance}
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            incomeChange={incomeChange}
            expenseChange={expenseChange}
            isLoading={isLoadingCards || isLoadingTransactions}
          />

          {/* Linked Cards Section */}
          <LinkedCards 
            cards={cards}
            isLoading={isLoadingCards}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Tracker & Transactions Section */}
            <div className="lg:col-span-2">
              <BudgetTracker 
                budgets={budgetsWithSpending}
                categories={categories}
                isLoading={isLoadingBudgets || isLoadingCategories}
              />
              
              <RecentTransactions 
                transactions={transactions}
                categories={categories}
                isLoading={isLoadingTransactions || isLoadingCategories}
              />
            </div>

            {/* Insights and Analytics Section */}
            <div className="lg:col-span-1">
              <SavingsGoals 
                goals={savingsGoalsWithPercentage}
                isLoading={isLoadingSavingsGoals}
              />
              
              <MonthlySpending 
                transactions={transactions}
                categories={categories}
                isLoading={isLoadingTransactions || isLoadingCategories}
              />
              
              <AIInsights 
                insights={aiInsights}
                isLoading={isLoadingInsights}
                onRefresh={handleRefreshInsights}
                isRefreshing={refreshingInsights}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNavigation />

      {/* Modals */}
      {activeModal === "chatbot" && <ChatbotModal />}
      {activeModal === "addCard" && <AddCardModal />}
      {activeModal === "addBudget" && <AddBudgetModal categories={categories} />}
      {activeModal === "addSavingsGoal" && <AddSavingsGoalModal />}
    </div>
  );
}
