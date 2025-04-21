import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  DollarSign, 
  PiggyBank,
  Bot,
  Wallet
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const navigationItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Cards",
    href: "/cards",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: <PieChart className="w-5 h-5" />,
  }
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-between px-3">
        {navigationItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center py-2 px-3",
                location === item.href
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}