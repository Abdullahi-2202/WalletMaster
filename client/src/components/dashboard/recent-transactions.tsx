import { Transaction, Category } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
}

export function RecentTransactions({
  transactions,
  categories,
  isLoading,
}: RecentTransactionsProps) {
  // Get category by ID
  const getCategoryById = (categoryId: number) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  // Get icon for transaction type
  const getTransactionIcon = (categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category?.icon || "question-circle";
  };

  // Get color for transaction type
  const getTransactionIconColor = (categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category?.color || "#6B7280";
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="px-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Link href="/transactions">
              <a className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none">
                View All
              </a>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <Link href="/transactions">
            <a className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none group">
              View All 
              <ArrowRight className="h-4 w-4 inline ml-1 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{
                      backgroundColor: `${getTransactionIconColor(transaction.categoryId)}20`,
                      color: getTransactionIconColor(transaction.categoryId),
                    }}
                  >
                    <i className={`fas fa-${getTransactionIcon(transaction.categoryId)}`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{transaction.merchant}</h3>
                    <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                  </div>
                </div>
                <div
                  className={`font-medium ${
                    transaction.type === "expense" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

RecentTransactions.defaultProps = {
  transactions: [],
  categories: [],
  isLoading: false,
};
