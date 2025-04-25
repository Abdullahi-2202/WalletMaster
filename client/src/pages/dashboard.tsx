import { useEffect, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentMonthYear, formatCurrency } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { MonthlySpending } from "@/components/dashboard/monthly-spending";
import { ChatbotModal } from "@/components/chatbot/chatbot-modal";
import { AddCardModal } from "@/components/forms/add-card-modal";
import { AddBudgetModal } from "@/components/forms/add-budget-modal";
import { AddSavingsGoalModal } from "@/components/forms/add-savings-goal-modal";
import { ModalContext } from "@/App";
import { queryClient } from "@/lib/queryClient";
import { CardType, BudgetType, CategoryType, TransactionType, SavingsGoalType, AiInsightType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

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
  const totalBalance = Array.isArray(cards) 
    ? cards.reduce((sum, card) => sum + Number(card.balance), 0)
    : 0;
  
  const monthlyIncome = Array.isArray(transactions)
    ? transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    : 0;
  
  const monthlyExpenses = Array.isArray(transactions)
    ? transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    : 0;

  // Mock data for visualizations (in a real app this would come from the API)
  const incomeChange = 5.1;
  const expenseChange = 2.4;

  // Calculate spending for each budget
  const budgetsWithSpending = Array.isArray(budgets) 
    ? budgets.map(budget => {
        const spent = Array.isArray(transactions)
          ? transactions
              .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
              .reduce((sum, t) => sum + Number(t.amount), 0)
          : 0;
        
        const percentage = (spent / Number(budget.amount)) * 100;
        
        return {
          ...budget,
          spent,
          percentage
        };
      })
    : [];

  // Calculate percentage for each savings goal
  const savingsGoalsWithPercentage = Array.isArray(savingsGoals)
    ? savingsGoals.map(goal => {
        const percentage = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
        
        return {
          ...goal,
          percentage
        };
      })
    : [];

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

  // Force a return of the dashboard regardless of user authentication
  // This bypasses the user check that was previously here

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 w-full mx-auto px-4 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          {/* Welcome Section */}
          <div className="mb-4 mt-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className="text-gray-600 text-sm">
              Your financial summary for {getCurrentMonthYear()}
            </p>
          </div>

          {/* Account Balance Summary - Mobile Style (iOS/Android inspired) */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <Card className="shadow-md bg-gradient-to-r from-primary/90 to-blue-600 text-white overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4">
                  <p className="text-sm font-medium text-white/80">Total Balance</p>
                  <h2 className="text-3xl font-bold">
                    {formatCurrency(totalBalance)}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xs font-medium text-white/70">Income</p>
                    <h3 className="text-xl font-semibold">{formatCurrency(monthlyIncome)}</h3>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-300" />
                      <span className="text-xs text-green-300">{Math.abs(incomeChange)}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xs font-medium text-white/70">Expenses</p>
                    <h3 className="text-xl font-semibold">{formatCurrency(monthlyExpenses)}</h3>
                    <div className="flex items-center mt-1">
                      {expenseChange > 0 ? (
                        <>
                          <ArrowUpRight className="h-3 w-3 mr-1 text-red-300" />
                          <span className="text-xs text-red-300">{Math.abs(expenseChange)}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-3 w-3 mr-1 text-green-300" />
                          <span className="text-xs text-green-300">{Math.abs(expenseChange)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Spending Section - Full Width Mobile Style */}
          <div className="mb-6">
            <Card className="shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 py-4 px-5 border-b">
                  <h3 className="text-lg font-semibold">Monthly Spending</h3>
                  <p className="text-xs text-gray-500">{getCurrentMonthYear()}</p>
                </div>
                
                {isLoadingTransactions || isLoadingCategories ? (
                  <div className="p-5">
                    <Skeleton className="h-[220px] w-full mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center">
                          <Skeleton className="w-3 h-3 rounded-full mr-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="h-[220px] w-full">
                      <MonthlySpending 
                        transactions={transactions}
                        categories={categories}
                        isLoading={false}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
