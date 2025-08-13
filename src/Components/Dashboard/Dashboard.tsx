import {
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Smartphone,
} from "lucide-react";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      color: "bg-status-success",
      bgColor: "bg-status-success/20",
      textColor: "text-status-success",
    },
    {
      title: "Total Organization",
      value: "1,234",
      change: "+8.2%",
      changeType: "increase",
      icon: Building,
      color: "bg-status-info",
      bgColor: "bg-status-info/20",
      textColor: "text-status-info",
    },
    {
      title: "Total Devices",
      value: "156",
      change: "-3.1%",
      changeType: "decrease",
      icon: Smartphone,
      color: "bg-status-warning",
      bgColor: "bg-status-warning/20",
      textColor: "text-status-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back! Here's what's happening with your WMS today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-text-primary">
            <Calendar className="w-4 h-4" />
            <span>{currentTime.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-primary rounded-lg shadow-sm border border-border-secondary p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-text-secondary">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
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
              <span className={`text-sm font-medium ${stat.textColor}`}>
                {stat.change}
              </span>
              <span className="text-sm text-text-secondary ml-1">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
