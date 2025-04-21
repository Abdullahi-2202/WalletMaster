import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/utils";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { Notifications } from "@/components/ui/notifications";
import { Bell } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle profile menu
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  // Toggle notifications
  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center space-x-1 text-xl font-semibold">
                <span className="text-primary">Wallet</span>
                <span className="text-gray-800">Master</span>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <button
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none relative"
                onClick={handleNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              
              {showNotifications && <Notifications />}
            </div>
            
            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center bg-gray-50 rounded-full p-1 focus:outline-none"
                onClick={handleProfileClick}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {getUserInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
              </button>
              
              {showProfileMenu && <ProfileDropdown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
