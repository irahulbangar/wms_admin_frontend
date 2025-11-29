import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/organization/plants")) {
      setCurrentPage("plants");
    } else if (path.startsWith("/organization/departments")) {
      setCurrentPage("departments");
    } else if (path.startsWith("/organization/systems")) {
      setCurrentPage("systems");
    } else if (path.startsWith("/organization/devices")) {
      setCurrentPage("devices");
    } else if (path.startsWith("/organization/users")) {
      setCurrentPage("users");
    } else if (path === "/organization") {
      setCurrentPage("organization");
    } else if (path.startsWith("/admin-users")) {
      setCurrentPage("admin-users");
    } else if (path.startsWith("/data-sync")) {
      setCurrentPage("data-sync");
    } else if (path.startsWith("/profile")) {
      setCurrentPage("profile");
    } else if (path.startsWith("/admin-setting")) {
      setCurrentPage("admin-setting");
    } else if (path === "/home" || path === "/") {
      setCurrentPage("dashboard");
    }
  }, [location.pathname]);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
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
            <Outlet />
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
