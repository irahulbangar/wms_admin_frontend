import {
  Building,
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Monitor,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSelector } from "../../../store/store";

interface SubmenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
  },
  {
    id: "organizations",
    icon: <Building2 className="w-5 h-5" />,
    label: "Organizations",
    submenu: [
      {
        id: "organization",
        label: "Organization",
        icon: <Building className="w-5 h-5" />,
        href: "/organization",
      },
      {
        id: "projects",
        label: "Projects",
        icon: <FileText className="w-5 h-5" />,
        href: "/organization/projects",
      },
      {
        id: "devices",
        label: "Devices",
        icon: <Monitor className="w-5 h-5" />,
        href: "/organization/devices",
      },
      {
        id: "users",
        label: "Users",
        icon: <User className="w-5 h-5" />,
        href: "/organization/users",
      },
      {
        id: "organization-setting",
        label: "Setting",
        icon: <Settings className="w-5 h-5" />,
        href: "/organization/setting",
      },
    ],
  },
  {
    id: "admin-users",
    icon: <Users className="w-5 h-5" />,
    label: "Admin Users",
  },
  {
    id: "settings",
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    submenu: [
      {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5" />,
        href: "/profile",
      },
      {
        id: "admin-setting",
        label: "Setting",
        icon: <Settings className="w-5 h-5" />,
        href: "/admin-setting",
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
  const { admin } = useAppSelector((state) => state.admin);
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved ? new Set(JSON.parse(saved)) : new Set(["dashboard"]);
  });

  useEffect(() => {
    localStorage.setItem(
      "sidebar-expanded",
      JSON.stringify(Array.from(expanded))
    );
  }, [expanded]);

  const isMenuItemActive = (item: (typeof menuItems)[0]) => {
    if (currentPage === item.id) {
      return true;
    }

    if (item.submenu) {
      return item.submenu.some(
        (submenu: SubmenuItem) => currentPage === submenu.id
      );
    }

    return false;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.clear();
      newExpanded.add(itemId);
    }
    setExpanded(newExpanded);
  };

  const handleSubmenuClick = (submenu: SubmenuItem) => {
    if (submenu.id === "devices") {
      onPageChange("devices");
    } else if (submenu.id === "users") {
      onPageChange("users");
    } else if (submenu.id === "organization-setting") {
      onPageChange("organization-setting");
    } else {
      onPageChange(submenu.id);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-primary backdrop-blur-xl border-r border-border-primary flex flex-col z-10 h-full fixed top-0 left-0 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="px-5 py-3.5 border-b border-border-primary shadow-xs flex items-center justify-center">
        <img src="/logo.png" alt="logo" className="h-16 w-32 object-contain" />
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-full">
        {menuItems.map((item) => {
          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isMenuItemActive(item)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-text-primary hover:bg-hover-bg-primary"
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
                    <span className="font-medium ml-2 font-roboto text-lg">
                      {item.label}
                    </span>
                  )}
                </div>
                {!collapsed && item.submenu && (
                  <ChevronDown className="w-4 h-4 transition-transform" />
                )}
              </button>

              {!collapsed && item.submenu && expanded.has(item.id) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu?.map((submenu: SubmenuItem) => {
                    return (
                      <button
                        key={submenu.id}
                        className={`w-full flex items-center text-left p-2 text-sm rounded-lg transition-all cursor-pointer ${
                          currentPage === submenu.id
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:text-white"
                            : "text-text-primary hover:text-text-primary hover:bg-hover-bg-primary"
                        }`}
                        onClick={() => {
                          handleSubmenuClick(submenu);
                        }}
                      >
                        {submenu.icon}
                        <span className="font-medium ml-2 font-roboto text-base">
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

      {!collapsed && (
        <div className="p-4 border-t border-border-primary">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-secondary">
            <User className="w-10 h-10 text-text-primary rounded-full bg-primary p-2" />
            <div className="flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-text-primary truncate">
                  {admin?.name}
                </p>
                <p className="text-sm text-text-secondary truncate">
                  {admin?.role}
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
