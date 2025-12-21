import Login from "./Components/Login";
import AuthInitializer from "./Components/AuthInitializer";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "../store/store";
import DiagramPage from "./Components/DiagramPage";
import RootLayout from "./Components/Layout/RootLayout";
import Dashboard from "./Components/Dashboard/Dashboard";
import Organization from "./Components/Organization/Organization";
import Plants from "./Components/Organization/Plant/Plants";
import Departments from "./Components/Organization/Department/Departments";
import Systems from "./Components/Organization/System/Systems";
import Devices from "./Components/Organization/Device/Devices";
import FMReport from "./Components/Organization/Device/DeviceReport/FMReport";
import OrganizationUsers from "./Components/Organization/OrganizationUser/OrganizationUsers";
import AdminUsers from "./Components/Settings/AdminUsers";
import DataSync from "./Components/Services/DataSync";
import Setting from "./Components/Organization/Setting";
import AdminSetting from "./Components/Settings/AdminSetting";
import Profile from "./Components/Settings/Profile";
import BRWHMSReport from "./Components/Organization/Device/DeviceReport/BRWHMSReport";
import BTLMReport from "./Components/Organization/Device/DeviceReport/BTLMReport";
import ARGReport from "./Components/Organization/Device/DeviceReport/ARGReport";
import PHMCReport from "./Components/Organization/Device/DeviceReport/PHMCReport";
import DWLRReport from "./Components/Organization/Device/DeviceReport/DWLRReport";

function ThemedToast() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/plant-layout/:plant_id",
    element: <DiagramPage />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/home", element: <Dashboard /> },
      { path: "/organization", element: <Organization /> },
      { path: "/organization/plants", element: <Plants /> },
      { path: "/organization/plants/:organization_id", element: <Plants /> },
      { path: "/organization/departments", element: <Departments /> },
      {
        path: "/organization/departments/:organization_id/:plant_id",
        element: <Departments />,
      },
      { path: "/organization/systems", element: <Systems /> },
      {
        path: "/organization/systems/:organization_id/:plant_id/:department_id",
        element: <Systems />,
      },
      { path: "/organization/devices", element: <Devices /> },
      {
        path: "/organization/devices/:organization_id/:plant_id/:department_id/:system_id",
        element: <Devices />,
      },
      {
        path: "/organization/devices/report/fm/:plant_id/:device_id",
        element: <FMReport />,
      },
      {
        path: "/organization/devices/report/brwhms/:plant_id/:device_id",
        element: <BRWHMSReport />,
      },
      {
        path: "/organization/devices/report/tank/:plant_id/:device_id",
        element: <BTLMReport />,
      },
      {
        path: "/organization/devices/report/phmc/:plant_id/:device_id",
        element: <PHMCReport />,
      },
      {
        path: "/organization/devices/report/arg/:plant_id/:device_id",
        element: <ARGReport />,
      },
      {
        path: "/organization/devices/report/dwlr/:plant_id/:device_id",
        element: <DWLRReport />,
      },
      { path: "/organization/users", element: <OrganizationUsers /> },
      { path: "/organization/setting", element: <Setting /> },
      { path: "/admin-users", element: <AdminUsers /> },
      { path: "/data-sync", element: <DataSync /> },
      { path: "/profile", element: <Profile /> },
      { path: "/admin-setting", element: <AdminSetting /> },
      { path: "/", element: <Navigate to="/home" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthInitializer>
          <RouterProvider router={router} />

          <ThemedToast />
          {/* <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/plants"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/plants/:organization_id"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/departments"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/departments/:organization_id/:plant_id"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/systems"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/systems/:organization_id/:plant_id/:department_id"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/devices"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/devices/:organization_id/:plant_id/:department_id/:system_id"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/users"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/setting"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-users"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/data-sync"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-setting"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plant-layout/:plant_id"
                  element={
                    <ProtectedRoute>
                      <DiagramPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <ThemedToast />
            </div>
          </Router> */}
        </AuthInitializer>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
