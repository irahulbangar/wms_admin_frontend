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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSelector } from "../../../store/store";
import Logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";

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
        id: "plants",
        label: "Plants",
        icon: <FileText className="w-5 h-5" />,
        href: "/organization/plants",
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
      // {
      //   id: "organization-setting",
      //   label: "Setting",
      //   icon: <Settings className="w-5 h-5" />,
      //   href: "/organization/setting",
      // },
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
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isOpen,
  setIsOpen,
}) => {
  const { admin } = useAppSelector((state) => state.admin);
  const navigate = useNavigate();
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
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 bg-opacity-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-primary border-r border-border-primary
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className={`flex items-center px-5 py-3.5 border-b border-border-primary ${
            isOpen ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex items-center justify-center">
            <img
              onClick={() => navigate("/")}
              src={Logo}
              alt="logo"
              className="h-16 w-32 object-contain cursor-pointer"
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-full">
          {menuItems?.map((item) => {
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
                      if (window.innerWidth < 1024) {
                        setTimeout(() => setIsOpen(false), 100);
                      }
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium ml-2 font-roboto text-lg">
                      {item.label}
                    </span>
                  </div>
                  {isOpen && item.submenu && (
                    <ChevronDown className="w-4 h-4 transition-transform" />
                  )}
                </button>

                {item.submenu && expanded.has(item.id) && (
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
                            if (window.innerWidth < 1024) {
                              setTimeout(() => setIsOpen(false), 100);
                            }
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

        {!isOpen && (
          <div className="p-4 border-t border-border-primary">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-hover-bg-primary">
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
    </>
  );
};

export default Sidebar;
