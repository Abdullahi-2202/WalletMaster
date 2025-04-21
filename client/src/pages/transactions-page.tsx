import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Filter, Search, ArrowUpDown, Plus } from "lucide-react";
import { CategoryType, TransactionType } from "@/types";
import { Loader2 } from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  
  // Fetch transactions (all transactions, not limited)
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionType[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<CategoryType[]>({
    queryKey: ["/api/categories"],
  });

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

  // If user not logged in, return empty fragment
  if (!user) return <></>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Transactions</h1>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10" 
                placeholder="Search transactions..." 
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> 
                Filter
              </Button>
            </div>
          </div>
          
          {/* Transactions Table */}
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg font-semibold">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingTransactions || isLoadingCategories ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No transactions yet</p>
                  <Button>Add Your First Transaction</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          <Button variant="ghost" className="p-0 h-auto font-medium text-sm text-gray-500">
                            Merchant <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          <Button variant="ghost" className="p-0 h-auto font-medium text-sm text-gray-500">
                            Date <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">
                          <Button variant="ghost" className="p-0 h-auto font-medium text-sm text-gray-500">
                            Amount <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                                style={{
                                  backgroundColor: `${getTransactionIconColor(transaction.categoryId)}20`,
                                  color: getTransactionIconColor(transaction.categoryId),
                                }}
                              >
                                <i className={`fas fa-${getTransactionIcon(transaction.categoryId)}`}></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{transaction.merchant}</div>
                                {transaction.description && (
                                  <div className="text-xs text-gray-500">{transaction.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getTransactionIconColor(transaction.categoryId) }}
                              ></div>
                              <span>{getCategoryById(transaction.categoryId)?.name || "Uncategorized"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(transaction.date)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={transaction.type === "expense" ? "text-red-500" : "text-green-500"}>
                              {transaction.type === "expense" ? "-" : "+"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}