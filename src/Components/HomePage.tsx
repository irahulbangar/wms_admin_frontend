import Sidebar from "./Layout/Sidebar";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile";
import Devices from "./Organization/Devices";
import OrganizationUsers from "./Organization/OrganizationUsers";
import AdminSetting from "./AdminSetting";
import Setting from "./Organization/Setting";
import Organization from "./Organization/Organization";
import Loader from "./Loader";
import Projects from "./Organization/Project";
import AdminUsers from "./AdminUsers";

const HomePage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [currentPage, setCurrentPage] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (location.pathname === "/organization") {
      setCurrentPage("organization");
    } else if (location.pathname === "/organization/projects") {
      setCurrentPage("projects");
    } else if (location.pathname.startsWith("/organization/projects/")) {
      setCurrentPage("projects");
    } else if (location.pathname === "/organization/devices") {
      setCurrentPage("devices");
    } else if (location.pathname.startsWith("/organization/devices/")) {
      setCurrentPage("devices");
    } else if (location.pathname === "/organization/users") {
      setCurrentPage("users");
    } else if (location.pathname === "/organization/setting") {
      setCurrentPage("organization-setting");
    } else if (location.pathname === "/home") {
      setCurrentPage("dashboard");
    } else if (location.pathname === "/profile") {
      setCurrentPage("profile");
    } else if (location.pathname === "/admin-users") {
      setCurrentPage("admin-users");
    } else if (location.pathname === "/admin-setting") {
      setCurrentPage("admin-setting");
    }
  }, [location.pathname]);

  if (isLoading || !isAuthenticated) {
    return <Loader />;
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page);

    switch (page) {
      case "organization":
        navigate("/organization");
        break;
      case "projects":
        navigate("/organization/projects");
        break;
      case "devices":
        navigate("/organization/devices");
        break;
      case "users":
        navigate("/organization/users");
        break;
      case "organization-setting":
        navigate("/organization/setting");
        break;
      case "dashboard":
        navigate("/home");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "admin-users":
        navigate("/admin-users");
        break;
      case "admin-setting":
        navigate("/admin-setting");
        break;
      default:
        navigate("/home");
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "organization":
        return <Organization />;
      case "projects":
        return <Projects />;
      case "devices":
        return <Devices />;
      case "users":
        return <OrganizationUsers />;
      case "organization-setting":
        return <Setting />;
      case "profile":
        return <Profile />;
      case "admin-users":
        return <AdminUsers />;
      case "admin-setting":
        return <AdminSetting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-full transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main
            className={`flex-1 h-full bg-input-bg p-6 space-y-6 mt-22 overflow-y-auto pb-16 ${
              sidebarCollapsed ? "ml-20" : "ml-72"
            }`}
          >
            {renderContent()}
          </main>
          <Footer sidebarCollapsed={sidebarCollapsed} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
