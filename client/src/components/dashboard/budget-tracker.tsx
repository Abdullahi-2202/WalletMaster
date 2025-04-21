import { useContext } from "react";
import { Budget, Category } from "@/types";
import { formatCurrency, formatPercentage, calculatePercentage, getProgressColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Settings } from "lucide-react";
import { ModalContext } from "@/App";
import { Skeleton } from "@/components/ui/skeleton";

interface BudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  isLoading: boolean;
}

export function BudgetTracker({ budgets, categories, isLoading }: BudgetTrackerProps) {
  const { setActiveModal } = useContext(ModalContext);

  const handleAddBudget = () => {
    setActiveModal("addBudget");
  };

  // Get category by ID
  const getCategoryById = (categoryId: number) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm mb-6">
        <CardHeader className="px-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Budget Tracker</CardTitle>
            <button className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none">
              <Settings className="h-4 w-4 inline mr-1" /> Manage
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm mb-6">
      <CardHeader className="px-5 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Budget Tracker</CardTitle>
          <button
            className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none"
            onClick={handleAddBudget}
          >
            <Settings className="h-4 w-4 inline mr-1" /> Manage
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No budgets set yet</p>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium"
                onClick={handleAddBudget}
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            budgets.map((budget) => {
              const category = getCategoryById(budget.categoryId);
              const percentage = calculatePercentage(budget.spent || 0, budget.amount);
              
              return (
                <div key={budget.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}
                        style={{ 
                          backgroundColor: `${category?.color}20`, 
                          color: category?.color
                        }}
                      >
                        <i className={`fas fa-${category?.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{category?.name}</h3>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(budget.spent || 0)} of {formatCurrency(budget.amount)}
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`text-sm font-medium ${
                        percentage > 100 ? "text-red-500" : ""
                      }`}
                    >
                      {formatPercentage(percentage)}
                    </div>
                  </div>
                  <Progress 
                    value={percentage > 100 ? 100 : percentage} 
                    className="h-2"
                    indicatorClassName={`${getProgressColor(percentage)}`}
                  />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

BudgetTracker.defaultProps = {
  budgets: [],
  categories: [],
  isLoading: false,
};
