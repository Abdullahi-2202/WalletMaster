import { useContext } from "react";
import { SavingsGoal } from "@/types";
import { formatCurrency, formatPercentage, calculatePercentage, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";
import { ModalContext } from "@/App";
import { Skeleton } from "@/components/ui/skeleton";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  isLoading: boolean;
}

export function SavingsGoals({ goals, isLoading }: SavingsGoalsProps) {
  const { setActiveModal } = useContext(ModalContext);

  const handleAddSavingsGoal = () => {
    setActiveModal("addSavingsGoal");
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm mb-6">
        <CardHeader className="px-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
            <button className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none">
              <PlusCircle className="h-4 w-4 inline mr-1" /> Add
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-3 mb-4 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full mb-1" />
              <div className="flex justify-end">
                <Skeleton className="h-3 w-24" />
              </div>
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
          <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
          <button
            className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none"
            onClick={handleAddSavingsGoal}
          >
            <PlusCircle className="h-4 w-4 inline mr-1" /> Add
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No savings goals set yet</p>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium"
                onClick={handleAddSavingsGoal}
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
              
              return (
                <div key={goal.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{goal.name}</h3>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </div>
                    </div>
                    {goal.targetDate && (
                      <span className="text-xs font-medium text-gray-500">
                        {formatDate(goal.targetDate)}
                      </span>
                    )}
                  </div>
                  <Progress value={percentage} className="h-2 mb-1" />
                  <div className="text-xs text-gray-500 text-right">
                    {formatPercentage(percentage)} Complete
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

SavingsGoals.defaultProps = {
  goals: [],
  isLoading: false,
};
