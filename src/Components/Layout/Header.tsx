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
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="bg-theme-primary backdrop-blur-xl border-b border-theme-primary px-6 py-4 shadow-theme-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-theme-secondary hover-theme-primary transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-theme-primary">
              Dashboard
            </h1>
            <p className="text-theme-secondary">
              Welcome back, Jhon!
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
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-theme-muted hover:text-theme-secondary">
              <Filter />
            </button>
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center space-x-3">
          <button 
            className="p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notification */}
          <button className="relative p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-xl text-theme-secondary hover-theme-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div
            className="flex items-center space-x-3 pl-3 border-l border-theme-primary"
          >
            <User className="w-5 h-5 text-theme-primary" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-theme-primary">
                Jhon Doe
              </p>
              <p className="text-xs text-theme-muted">
                Administrator
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-theme-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
