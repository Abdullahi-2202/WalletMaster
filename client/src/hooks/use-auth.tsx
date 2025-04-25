import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UserWithoutPassword = Omit<User, "password">;

type AuthContextType = {
  user: UserWithoutPassword;
  isLoading: boolean;
  error: null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Create a mock user that will always be returned
  const mockUser: UserWithoutPassword = {
    id: 1,
    username: "demo_user",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com",
    createdAt: new Date(),
    profileImage: null
  };

  // Immediately navigate to dashboard when login or register is called
  const loginMutation = {
    mutate: () => {
      // Show success toast just for visual feedback
      toast({
        title: "Login successful",
        description: `Welcome back, ${mockUser.firstName}!`,
      });
      
      // Navigate to dashboard
      navigate("/");
    },
    isPending: false,
  };

  const registerMutation = {
    mutate: () => {
      // Show success toast just for visual feedback
      toast({
        title: "Registration successful",
        description: `Welcome to Wallet Master, ${mockUser.firstName}!`,
      });
      
      // Navigate to dashboard
      navigate("/");
    },
    isPending: false,
  };

  const logoutMutation = {
    mutate: () => {},
    isPending: false,
  };

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        isLoading: false,
        error: null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
