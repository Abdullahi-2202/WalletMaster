import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import TransactionsPage from "@/pages/transactions-page";
import BudgetsPage from "@/pages/budgets-page";
import SavingsGoalsPage from "@/pages/savings-goals-page";
import CardsPage from "@/pages/cards-page";
import InsightsPage from "@/pages/insights-page";
import PaymentsPage from "@/pages/payments-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { useState, createContext } from "react";
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
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/budgets" component={BudgetsPage} />
      <ProtectedRoute path="/savings-goals" component={SavingsGoalsPage} />
      <ProtectedRoute path="/cards" component={CardsPage} />
      <ProtectedRoute path="/insights" component={InsightsPage} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
