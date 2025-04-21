import { useState, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserInitials } from "@/lib/utils";
import { Bell, MessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalContext } from "@/App";
import { Link } from "wouter";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const { setActiveModal } = useContext(ModalContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOpenChatbot = () => {
    setActiveModal("chatbot");
  };

  if (!user) return <></>;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Logo - visible only on mobile */}
        <div className="md:hidden">
          <Link href="/">
            <a className="flex items-center space-x-1 text-xl font-semibold">
              <span className="text-primary">Wallet</span>
              <span className="text-gray-800">Master</span>
            </a>
          </Link>
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center gap-3 ml-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex relative"
            onClick={handleOpenChatbot}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.firstName} />
                  ) : (
                    <AvatarFallback>
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-gray-500 mt-1">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="cursor-pointer w-full">
                    Profile Settings
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="cursor-pointer w-full">
                    Account Settings
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 pb-3">
          <nav className="px-4">
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="flex items-center py-2 text-gray-700 hover:text-primary">
                    <span>Dashboard</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/insights">
                  <a className="flex items-center py-2 text-gray-700 hover:text-primary">
                    <span>AI Insights</span>
                  </a>
                </Link>
              </li>
              <li>
                <Button 
                  variant="ghost"
                  className="flex w-full justify-start p-2 text-gray-700 hover:text-primary hover:bg-transparent"
                  onClick={handleOpenChatbot}
                >
                  <span>Financial Assistant</span>
                </Button>
              </li>
              <li>
                <Link href="/settings">
                  <a className="flex items-center py-2 text-gray-700 hover:text-primary">
                    <span>Settings</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="flex items-center py-2 text-gray-700 hover:text-primary">
                    <span>Help & Support</span>
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}