import { TransactionType as Transaction, CategoryType as Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentMonthYear } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlySpendingProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
}

export function MonthlySpending({
  transactions,
  categories,
  isLoading,
}: MonthlySpendingProps) {
  // Process transactions data for chart
  const processChartData = () => {
    if (!transactions.length || !categories.length) return [];

    // Create a map to sum up expenses by category
    const categoryTotals = new Map<number, number>();
    
    // Only consider expense transactions
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const currentTotal = categoryTotals.get(transaction.categoryId) || 0;
        categoryTotals.set(transaction.categoryId, currentTotal + Number(transaction.amount));
      });
    
    // Convert to chart data format
    return Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || "Other",
          value: amount,
          color: category?.color || "#9CA3AF"
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  const chartData = processChartData();

  if (isLoading) {
    return (
      <Card className="shadow-sm mb-6">
        <CardHeader className="px-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Monthly Spending</CardTitle>
            <div className="text-sm text-gray-500">{getCurrentMonthYear()}</div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <Skeleton className="h-[180px] w-full mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-3 h-3 rounded-full mr-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {chartData.length > 0 ? (
        <>
          <div className="h-[180px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  hide={true}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Amount"]}
                  labelStyle={{ color: "#111827" }}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    padding: "8px 12px"
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Category legend with amounts */}
          <div className="space-y-3">
            {chartData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <span className="text-sm font-semibold">${category.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-gray-500 text-sm">No spending data available</p>
        </div>
      )}
    </>
  );
}

MonthlySpending.defaultProps = {
  transactions: [],
  categories: [],
  isLoading: false,
};
