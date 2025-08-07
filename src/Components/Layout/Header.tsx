import {
  Bell,
  ChevronDown,
  Filter,
  Menu,
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Success } from "../../utils/toast";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
    Success('You have been logged out successfully.');
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-theme-primary backdrop-blur-xl border-b border-theme-primary px-6 py-4 shadow-theme-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-theme-secondary hover-theme-primary transition-colors cursor-pointer"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-theme-primary">
              Dashboard
            </h1>
            <p className="text-theme-secondary">
              Welcome back, {user?.email || 'User'}!
            </p>
          </div>
        </div>
        {/* Center */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-2 text-theme-muted" />
            <input
              type="text"
              placeholder="Search Anything"
              className="w-full pl-10 pr-4 py-2.5 input-theme rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-theme-muted hover:text-theme-secondary cursor-pointer">
              <Filter />
            </button>
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center space-x-3">
          <button 
            className="p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors cursor-pointer"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notification */}
          <button className="relative p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-3 pl-3 border-l border-theme-primary p-2 rounded-lg hover-theme-primary transition-colors cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="w-5 h-5 text-theme-primary" />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-theme-primary">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-theme-muted">
                  Administrator
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-primary rounded-xl shadow-theme-lg z-50">
                <div className="py-2">
                  {/* Profile Option */}
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center px-4 py-3 text-theme-primary hover-theme-primary transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                  
                  {/* Divider */}
                  <div className="border-t border-theme-primary my-1"></div>
                  
                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
