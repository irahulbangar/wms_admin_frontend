import {
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Smartphone,
  FileText,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { OrganizationResult } from "../../../model/organizations.interface";
import { getOrganizations } from "../../../store/organizationSlice";
import type { AppDispatch } from "../../../store/store";
import { Error } from "../../utils/toast";
import { useDispatch } from "react-redux";
import type { ProjectResult } from "../../../model/project.interface";
import { getAllProjects } from "../../../store/projectSlice";
import { useNavigate } from "react-router-dom";
import type { ClientUsersResult } from "../../../model/client-users.interface";
import { getAllClients } from "../../../store/clientSlice";
import type { DeviceResult } from "../../../model/devices.interface";
import { getAllDevices } from "../../../store/deviceSlice";

const Dashboard = () => {
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dispatch = useDispatch<AppDispatch>();
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [users, setUsers] = useState<ClientUsersResult[]>([]);
  const [devices, setDevices] = useState<DeviceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganizations(res?.data);
        } else {
          Error(res.message || "Failed to fetch organizations");
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const fetchProjects = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllProjects())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setProjects(res?.data);
        } else {
          Error(res.message || "Failed to fetch plants");
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const fetchUsers = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllClients())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setUsers(res?.data);
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const fetchDevices = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllDevices())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDevices(res?.data);
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    fetchOrganizations();
    fetchProjects();
    fetchUsers();
    fetchDevices();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchOrganizations, fetchProjects, fetchUsers, fetchDevices]);

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "bg-status-success",
      bgColor: "bg-status-success/20",
      textColor: "text-status-success",
      href: "/organization/users",
    },
    {
      title: "Total Organization",
      value: organizations.length,
      change: "+8.2%",
      changeType: "increase",
      icon: Building,
      color: "bg-status-info",
      bgColor: "bg-status-info/20",
      textColor: "text-status-info",
      href: "/organization",
    },
    {
      title: "Total Plants",
      value: projects.length,
      change: "+8.2%",
      changeType: "increase",
      icon: FileText,
      color: "bg-status-success",
      bgColor: "bg-status-success/20",
      textColor: "text-status-success",
      href: "/organization/plants",
    },
    {
      title: "Total Devices",
      value: devices.length,
      change: "-3.1%",
      changeType: "decrease",
      icon: Smartphone,
      color: "bg-status-warning",
      bgColor: "bg-status-warning/20",
      textColor: "text-status-warning",
      href: "/organization/devices",
    },
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-start md:items-center md:justify-between justify-center w-full md:gap-4 gap-2 md:flex-row flex-col">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-roboto">
                Dashboard
              </h1>
              <p className="text-text-secondary font-roboto">
                Welcome back! Here's what's happening with your WMS today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-base text-text-primary font-roboto font-semibold">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <span>{currentTime.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-base text-text-primary font-roboto font-semibold">
                <Clock className="w-5 h-5 text-text-secondary" />
                <span className="font-roboto font-semibold text-base">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                onClick={() => handleNavigate(stat.href)}
                key={index}
                className="bg-primary rounded-lg shadow-sm border border-border-primary p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-text-secondary font-roboto">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1 font-roboto">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 text-text-primary`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.changeType === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 text-status-success mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-status-danger mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${stat.textColor} font-roboto`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-text-secondary ml-1 font-roboto">
                    from last month
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
