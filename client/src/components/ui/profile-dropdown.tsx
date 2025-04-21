import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function ProfileDropdown() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>

      <Link href="/profile">
        <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <User className="mr-3 h-4 w-4 text-gray-500" />
          Profile
        </a>
      </Link>

      <Link href="/cards">
        <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
          My Cards
        </a>
      </Link>

      <Link href="/settings">
        <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <Settings className="mr-3 h-4 w-4 text-gray-500" />
          Settings
        </a>
      </Link>

      <Link href="/help">
        <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
          Help & Support
        </a>
      </Link>

      <div className="border-t border-gray-100 mt-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="mr-3 h-4 w-4 text-gray-500" />
          Log out
        </button>
      </div>
    </div>
  );
}
