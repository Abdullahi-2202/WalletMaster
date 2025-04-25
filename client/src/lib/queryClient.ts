import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Completely bypass all API calls
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log("API call bypassed:", method, url);
  
  // Create a mock successful response with empty user data
  const mockData = {
    success: true,
    id: 1,
    username: "demo_user",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com"
  };
  
  // Create the mock response
  const mockResponse = new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return mockResponse;
}

// Create mock data for different routes
const getMockData = (queryKey: readonly unknown[]) => {
  const path = queryKey[0];
  
  if (typeof path !== 'string') {
    return null;
  }
  
  // Create mock data based on the path
  switch (path) {
    case '/api/user':
      return {
        id: 1,
        username: "demo_user",
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com",
        createdAt: new Date(),
        profileImage: null
      };
    
    case '/api/cards':
      return [
        {
          id: 1,
          userId: 1,
          cardType: "Visa",
          lastFour: "4242",
          expiryDate: "12/24",
          bankName: "Demo Bank",
          cardColor: "blue",
          balance: 2598.75,
          isDefault: true,
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 1,
          cardType: "Mastercard",
          lastFour: "8210",
          expiryDate: "08/25",
          bankName: "Digital Bank",
          cardColor: "purple",
          balance: 1350.40,
          isDefault: false,
          createdAt: new Date()
        }
      ];
    
    case '/api/transactions':
      return [
        {
          id: 1,
          userId: 1,
          cardId: 1,
          amount: 125.50,
          description: "Grocery Shopping",
          categoryId: 3,
          date: new Date(),
          type: "expense",
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 1,
          cardId: 1,
          amount: 2500,
          description: "Salary Deposit",
          categoryId: 1,
          date: new Date(),
          type: "income",
          createdAt: new Date()
        },
        {
          id: 3,
          userId: 1,
          cardId: 2,
          amount: 45.99,
          description: "Netflix Subscription",
          categoryId: 4,
          date: new Date(),
          type: "expense",
          createdAt: new Date()
        }
      ];
    
    case '/api/categories':
      return [
        { id: 1, name: "Income", color: "green", icon: "wallet" },
        { id: 2, name: "Bills", color: "blue", icon: "receipt" },
        { id: 3, name: "Food", color: "orange", icon: "utensils" },
        { id: 4, name: "Entertainment", color: "purple", icon: "film" }
      ];
    
    case '/api/budgets':
      return [
        { id: 1, userId: 1, categoryId: 2, amount: 300, period: "monthly" },
        { id: 2, userId: 1, categoryId: 3, amount: 500, period: "monthly" },
        { id: 3, userId: 1, categoryId: 4, amount: 200, period: "monthly" }
      ];
    
    case '/api/savings-goals':
      return [
        { 
          id: 1, 
          userId: 1, 
          name: "Vacation Fund", 
          targetAmount: 2000, 
          currentAmount: 750, 
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          iconName: "palm-tree"
        },
        { 
          id: 2, 
          userId: 1, 
          name: "New Laptop", 
          targetAmount: 1200, 
          currentAmount: 450, 
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          iconName: "laptop"
        }
      ];
    
    case '/api/ai/insights':
      return [
        {
          id: 1,
          userId: 1,
          type: "spending",
          title: "Unusual Spending in Entertainment",
          description: "Your entertainment spending is 30% higher than last month. You might want to check your subscriptions.",
          date: new Date(),
          actionTaken: false
        },
        {
          id: 2,
          userId: 1,
          type: "saving",
          title: "Savings Opportunity",
          description: "Based on your income and spending, you could increase your monthly savings by $200.",
          date: new Date(),
          actionTaken: false
        }
      ];
      
    default:
      return null;
  }
};

// Mock query function
export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> =
  <T>({ on401: unauthorizedBehavior }: { on401: "returnNull" | "throw" }) =>
  async ({ queryKey }) => {
    console.log("Query call bypassed:", queryKey);
    
    // Get mock data based on queryKey
    const mockData = getMockData(queryKey);
    
    // If we have specific mock data for this route, return it
    if (mockData !== null) {
      return mockData as unknown as T;
    }
    
    // Default fallback for any other routes
    return {
      id: 1,
      success: true,
      data: [],
      message: "Operation successful"
    } as unknown as T;
  };

// Configure query client to always bypass auth
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      gcTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});
