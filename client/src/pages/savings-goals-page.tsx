import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Plus, Calendar, ChevronRight, Target } from "lucide-react";
import { formatCurrency, formatPercentage, calculatePercentage, formatDate, getDaysRemaining } from "@/lib/utils";
import { SavingsGoalType } from "@/types";
import { ModalContext } from "@/App";
import { AddSavingsGoalModal } from "@/components/forms/add-savings-goal-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavingsGoalsPage() {
  const { user } = useAuth();
  const { activeModal, setActiveModal } = useContext(ModalContext);
  
  // Fetch savings goals
  const { data: savingsGoals = [], isLoading } = useQuery<SavingsGoalType[]>({
    queryKey: ["/api/savings-goals"],
  });
  
  // Handle opening the add savings goal modal
  const handleAddSavingsGoal = () => {
    setActiveModal("addSavingsGoal");
  };
  
  // Calculate percentage for each savings goal
  const savingsGoalsWithPercentage = savingsGoals.map(goal => {
    const percentage = calculatePercentage(Number(goal.currentAmount), Number(goal.targetAmount));
    
    return {
      ...goal,
      percentage
    };
  });
  
  // If user not logged in, don't render anything
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Savings Goals</h1>
            <Button className="flex items-center" onClick={handleAddSavingsGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
          
          {/* Savings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">Total Saved</h3>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      savingsGoals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">Target Amount</h3>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      savingsGoals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">Active Goals</h3>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <div className="text-3xl font-bold">
                    {savingsGoals.length}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Savings Goals */}
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg font-semibold">Your Savings Goals</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full mb-1" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : savingsGoalsWithPercentage.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Savings Goals Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Set savings goals to track your progress towards specific financial targets like a vacation, new car, or emergency fund.
                  </p>
                  <Button onClick={handleAddSavingsGoal}>
                    Create Your First Savings Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savingsGoalsWithPercentage.map((goal) => {
                    const daysRemaining = goal.targetDate 
                      ? getDaysRemaining(goal.targetDate) 
                      : undefined;
                    
                    return (
                      <div key={goal.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-800 text-lg">{goal.name}</h3>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                            </div>
                          </div>
                          {goal.targetDate && (
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                              {daysRemaining !== undefined && (daysRemaining > 0 
                                ? `${daysRemaining} days left` 
                                : "Deadline passed")}
                            </div>
                          )}
                        </div>
                        
                        <Progress value={goal.percentage} className="h-2 mb-1" />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {goal.targetDate && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Target: {formatDate(goal.targetDate)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-1">
                              {formatPercentage(goal.percentage)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Savings Tips */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Savings Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                      <i className="fas fa-piggy-bank"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Automate Your Savings</h3>
                      <p className="text-sm text-gray-600">
                        Set up automatic transfers to your savings account on payday to build savings without thinking about it.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">The 20% Rule</h3>
                      <p className="text-sm text-gray-600">
                        Try to save at least 20% of your income each month for long-term goals and emergencies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                      <i className="fas fa-coins"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Small Regular Contributions</h3>
                      <p className="text-sm text-gray-600">
                        Making small but consistent deposits to your savings builds better habits than irregular larger amounts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Save Windfalls</h3>
                      <p className="text-sm text-gray-600">
                        When you receive unexpected money like tax refunds or bonuses, save at least half toward your goals.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {activeModal === "addSavingsGoal" && <AddSavingsGoalModal />}
    </div>
  );
}