import { Link, useLocation } from "wouter";
import { Home, CreditCard, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { ModalContext } from "@/App";

export function BottomNavigation() {
  const [location] = useLocation();
  const { setActiveModal } = useContext(ModalContext);

  const handleAddClick = () => {
    setActiveModal("addCard");
  };

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-between">
        <Link href="/">
          <a className={cn(
            "flex flex-col items-center py-2 px-3",
            location === "/" ? "text-primary" : "text-gray-500"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/budgets">
          <a className={cn(
            "flex flex-col items-center py-2 px-3",
            location === "/budgets" ? "text-primary" : "text-gray-500"
          )}>
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Budgets</span>
          </a>
        </Link>
        
        <button 
          onClick={handleAddClick}
          className="flex flex-col items-center py-2 px-3 text-gray-500"
        >
          <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center -mt-5 text-white">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Add</span>
        </button>
        
        <Link href="/cards">
          <a className={cn(
            "flex flex-col items-center py-2 px-3",
            location === "/cards" ? "text-primary" : "text-gray-500"
          )}>
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Cards</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={cn(
            "flex flex-col items-center py-2 px-3",
            location === "/profile" ? "text-primary" : "text-gray-500"
          )}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
