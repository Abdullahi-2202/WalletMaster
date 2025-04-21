import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  DollarSign, 
  Wallet, 
  Settings, 
  Bot, 
  PiggyBank,
  HelpCircle,
  CreditCard as CreditCardIcon
} from "lucide-react";

type SidebarItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Cards",
    href: "/cards",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: <PieChart className="w-5 h-5" />,
  },
  {
    name: "Savings Goals",
    href: "/savings-goals",
    icon: <PiggyBank className="w-5 h-5" />,
  },
  {
    name: "AI Insights",
    href: "/insights",
    icon: <Bot className="w-5 h-5" />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    name: "Help",
    href: "/help",
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200 fixed">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/">
          <a className="flex items-center space-x-1 text-xl font-semibold">
            <span className="text-primary">Wallet</span>
            <span className="text-gray-800">Master</span>
          </a>
        </Link>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-primary flex items-center">
            <Wallet className="w-4 h-4 mr-1" />
            Premium Features
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            Upgrade to access AI insights, custom reports, and premium support.
          </p>
          <button className="mt-2 text-xs bg-primary text-white py-1 px-2 rounded-md w-full">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
