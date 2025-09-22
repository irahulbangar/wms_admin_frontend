import {
  Users,
  Calendar,
  Clock,
  Building,
  FileText,
  Loader2,
  Monitor,
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
      icon: Users,
      gradient: "from-[#800080] to-[#ffc0cb]",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/organization/users",
    },
    {
      title: "Total Organization",
      value: organizations.length,
      icon: Building,
      gradient: "from-[#fc4a1a] to-[#f7b733]",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/organization",
    },
    {
      title: "Total Plants",
      value: projects.length,
      icon: FileText,
      gradient: "from-[#c0392b] to-[#8e44ad]",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      href: "/organization/plants",
    },
    {
      title: "Total Devices",
      value: devices.length,
      icon: Monitor,
      gradient: "from-[#283c86] to-[#45a247]",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/organization/devices",
    },
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center md:justify-end justify-center space-x-3">
            <div className="flex items-center space-x-2 text-text-primary">
              <Calendar className="w-5 h-5 text-text-secondary" />
              <span className="font-roboto font-semibold text-base">
                {currentTime.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-text-primary">
              <Clock className="w-5 h-5 text-text-secondary" />
              <span className="font-roboto font-semibold text-base">
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat, index) => (
              <div
                onClick={() => handleNavigate(stat.href)}
                key={index}
                className={`bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm p-6 hover:shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-102`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-white font-roboto">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white mt-1 font-roboto">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${stat.iconBg} backdrop-blur-sm`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
