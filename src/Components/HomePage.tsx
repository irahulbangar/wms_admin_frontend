import Sidebar from "./Layout/Sidebar";
import Header from "./Layout/Header";
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
import Plants from "./Organization/Plants";
import AdminUsers from "./AdminUsers";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    if (location.pathname === "/organization") {
      setCurrentPage("organization");
    } else if (location.pathname === "/organization/plants") {
      setCurrentPage("plants");
    } else if (location.pathname.startsWith("/organization/plants/")) {
      setCurrentPage("plants");
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
      case "plants":
        navigate("/organization/plants");
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
      case "plants":
        return <Plants />;
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
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-input-bg p-4 space-y-4">
            {renderContent()}
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
