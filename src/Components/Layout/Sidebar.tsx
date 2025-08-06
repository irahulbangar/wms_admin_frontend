import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  Monitor,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    active: true,
    badge: "New",
  },
  {
    id: "organization",
    icon: <Building2 className="w-5 h-5" />,
    label: "Organization",
    active: false,
    submenu: [
      {
        id: "devices",
        label: "Devices",
        active: false,
        icon: <Monitor className="w-5 h-5" />,
        href: "/devices",
      },
      {
        id: "users",
        label: "Organization Users",
        active: false,
        icon: <User className="w-5 h-5" />,
        href: "/organization/users",
      },
      {
        id: "setting",
        label: "Organization Setting",
        active: false,
        icon: <Settings className="w-5 h-5" />,
        href: "/organization/setting",
      },
    ],
  },
  {
    id: "admin-users",
    icon: <Users className="w-5 h-5" />,
    label: "Admin Users",
    active: false,
  },
  {
    id: "settings",
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    active: false,
    badge: "New",
    submenu: [
      {
        id: "profile",
        label: "Profile",
        active: false,
        icon: <User className="w-5 h-5" />,
        href: "/profile",
      },
      {
        id: "settings",
        label: "Settings",
        active: false,
        icon: <Settings className="w-5 h-5" />,
        href: "/settings",
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ collapsed, currentPage, onPageChange }: SidebarProps) => {
  const [expanded, setExpanded] = useState(new Set(["dashboard"]));

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpanded(newExpanded);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 shadow-xs">
        <div className="flex items-center gap-x-3">
          <img src="/logo.png" alt="logo" className="h-12 w-32" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.id || item.active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleExpanded(item.id);
                  } else {
                    onPageChange(item.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span className="font-medium ml-2">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-red-500 rounded-full text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {!collapsed && item.submenu && (
                  <ChevronDown className="w-4 h-4 transition-transform" />
                )}
              </button>

              {/* Submenu */}
              {!collapsed && item.submenu && expanded.has(item.id) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu?.map((submenu) => {
                    return (
                      <button
                        key={submenu.id}
                        className={`w-full flex items-center text-left p-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all ${
                          currentPage === submenu.id || submenu.active
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:text-white dark:hover:text-slate-200"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`}
                        onClick={() => {
                          onPageChange(submenu.id);
                        }}
                      >
                        {submenu.icon}
                        <span className="font-medium ml-2">
                          {submenu.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50">
            {/* <img src="" alt="user" className="w-10 h-10 rounded-full ring-2 ring-blue-500" /> */}
            <User className="w-8 h-8 text-slate-500 rounded-full ring-2 ring-blue-500" />
            <div className="flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  Jhon Doe
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
