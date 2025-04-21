import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceSummaryProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeChange: number;
  expenseChange: number;
  isLoading: boolean;
}

export function BalanceSummary({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  incomeChange,
  expenseChange,
  isLoading,
}: BalanceSummaryProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Balance</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalBalance)}
              </h2>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              3.2%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Income</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {formatCurrency(monthlyIncome)}
              </h2>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {Math.abs(incomeChange)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Expenses</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {formatCurrency(monthlyExpenses)}
              </h2>
            </div>
            <span 
              className={`px-2 py-1 text-xs font-medium rounded flex items-center ${
                expenseChange > 0 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
              }`}
            >
              {expenseChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(expenseChange)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

BalanceSummary.defaultProps = {
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  incomeChange: 0,
  expenseChange: 0,
  isLoading: false,
};
