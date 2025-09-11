import {
  Bell,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { logout } from "../../../store/adminSlice";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Success } from "../../utils/toast";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.admin);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get dynamic title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    // Route to title mapping
    const routeTitles: { [key: string]: string } = {
      "/": "Dashboard",
      "/dashboard": "Dashboard",
      "/profile": "Profile",
      "/organization": "Organizations",
      "/organization/plants": "Plants",
      "/organization/devices": "Devices",
      "/organization/users": "Organization Users",
      "/admin-users": "Admin Users",
      "/diagram": "Diagram",
      "/admin-setting": "Admin Settings",
      "/organization/setting": "Organization Settings",
    };

    // Check for dynamic routes with parameters
    if (path.includes("/organization/") && path.includes("/devices")) {
      return "Devices";
    }
    if (path.includes("/organization/") && path.includes("/users")) {
      return "Organization Users";
    }
    if (path.includes("/organization/") && path.includes("/plants")) {
      return "Plants";
    }

    // Return mapped title or default to 'Dashboard'
    return routeTitles[path] || "Dashboard";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsDropdownOpen(false);
    Success("You have been logged out successfully.");
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-primary border-b border-border-primary md:px-6 px-2 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-text-primary hover:text-foreground hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="block">
          <h1 className="text-2xl font-black text-text-primary font-roboto">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          className="p-2.5 rounded-xl text-text-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        <button className="relative p-2.5 rounded-xl text-text-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-status-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-roboto">
            3
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-3 pl-3 border-l border-border-primary p-2 rounded-lg hover:bg-hover-bg-primary transition-colors cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <User className="w-5 h-5 text-text-primary" />
            <div className="hidden md:block">
              <p className="text-base font-medium text-text-primary font-roboto">
                {admin?.name}
              </p>
              <p className="text-sm text-text-secondary font-roboto">
                {admin?.role === "admin" ? "Admin" : "Super Admin"}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-text-primary transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border-primary rounded-xl shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center px-4 py-3 text-text-primary hover:bg-hover-bg-primary transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 mr-3" />
                  <span className="text-base font-medium font-roboto">
                    Profile
                  </span>
                </button>

                <div className="border-t border-border-primary my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-base font-medium font-roboto">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
