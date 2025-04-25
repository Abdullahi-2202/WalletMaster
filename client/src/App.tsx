import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions-page";
import BudgetsPage from "@/pages/budgets-page";
import SavingsGoalsPage from "@/pages/savings-goals-page";
import CardsPage from "@/pages/cards-page";
import InsightsPage from "@/pages/insights-page";
import PaymentsPage from "@/pages/payments-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { useState, createContext, useEffect } from "react";
import { ModalType } from "./types";

// Context for managing global modals
export const ModalContext = createContext<{
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
}>({
  activeModal: null,
  setActiveModal: () => {},
});

function Router() {
  // Set mock user data in query client cache on load to ensure authentication
  useEffect(() => {
    queryClient.setQueryData(["/api/user"], {
      id: 1,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      createdAt: new Date(),
      profileImage: null
    });
  }, []);

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/budgets" component={BudgetsPage} />
      <Route path="/savings-goals" component={SavingsGoalsPage} />
      <Route path="/cards" component={CardsPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/payments" component={PaymentsPage} />
      {/* Sample login and registration page with dummy data */}
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Ensure user data is set even before accessing protected routes
  useEffect(() => {
    queryClient.setQueryData(["/api/user"], {
      id: 1,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      createdAt: new Date(),
      profileImage: null
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ModalContext.Provider value={{ activeModal, setActiveModal }}>
            <Toaster />
            <Router />
          </ModalContext.Provider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
