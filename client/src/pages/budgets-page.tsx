import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, PlusCircle, Plus, AlertTriangle } from "lucide-react";
import { formatCurrency, formatPercentage, getProgressColor } from "@/lib/utils";
import { BudgetType, CategoryType, TransactionType } from "@/types";
import { ModalContext } from "@/App";
import { AddBudgetModal } from "@/components/forms/add-budget-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsPage() {
  const { user } = useAuth();
  const { activeModal, setActiveModal } = useContext(ModalContext);
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<CategoryType[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch budgets
  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery<BudgetType[]>({
    queryKey: ["/api/budgets"],
  });
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionType[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Handle opening the add budget modal
  const handleAddBudget = () => {
    setActiveModal("addBudget");
  };
  
  // Get category by ID
  const getCategoryById = (categoryId: number) => {
    return categories.find((cat) => cat.id === categoryId);
  };
  
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
  
  const isLoading = isLoadingBudgets || isLoadingCategories || isLoadingTransactions;
  
  // If user not logged in, return empty fragment
  if (!user) return <></>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Budget Tracker</h1>
            <Button className="flex items-center" onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
          
          {/* Budgets Overview Card */}
          <Card className="shadow-sm mb-6">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <Skeleton className="w-10 h-10 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full mb-1" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : budgetsWithSpending.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <PieChart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Budgets Set</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Track your spending by setting up budgets for different categories. Get alerts when you're close to your limit.
                  </p>
                  <Button onClick={handleAddBudget}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetsWithSpending.map((budget) => {
                    const category = getCategoryById(budget.categoryId);
                    const progressColor = getProgressColor(budget.percentage);
                    const isOverBudget = budget.percentage > 100;
                    
                    return (
                      <div key={budget.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{
                                backgroundColor: `${category?.color || "#6B7280"}20`,
                                color: category?.color || "#6B7280",
                              }}
                            >
                              <i className={`fas fa-${category?.icon || "question-circle"}`}></i>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{category?.name || "Uncategorized"}</h3>
                              <div className="text-xs text-gray-500">
                                {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800">{formatCurrency(budget.amount)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(budget.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                              {budget.endDate && ` - ${new Date(budget.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                            </div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={Math.min(budget.percentage, 100)} 
                          className="h-2 mb-1"
                          style={{ 
                            backgroundColor: `${progressColor}20`,
                            color: progressColor 
                          }}
                        />
                        
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-600">
                            {formatCurrency(budget.spent)} spent
                            {isOverBudget && (
                              <div className="text-red-500 flex items-center text-xs mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Over budget by {formatCurrency(budget.spent - budget.amount)}
                              </div>
                            )}
                          </div>
                          <div className="font-medium" style={{ color: progressColor }}>
                            {formatPercentage(budget.percentage)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Budget Tips Card */}
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg font-semibold">Budgeting Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">The 50/30/20 Rule</h3>
                    <p className="text-sm text-gray-600">
                      Allocate 50% of your income to needs, 30% to wants, and 20% to savings or paying off debt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Zero-Based Budgeting</h3>
                    <p className="text-sm text-gray-600">
                      Assign every dollar a purpose. Your income minus your expenditures should equal zero.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Review Monthly</h3>
                    <p className="text-sm text-gray-600">
                      Set aside time each month to review your budget and make adjustments as needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {activeModal === "addBudget" && <AddBudgetModal categories={categories} />}
    </div>
  );
}