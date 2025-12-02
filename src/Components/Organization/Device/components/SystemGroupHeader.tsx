import { ChevronRight, ChevronDown } from "lucide-react";
import type { DeviceResult } from "../../../../../model/devices.interface";

interface SystemGroupHeaderProps {
  systemId: string;
  systemName: string;
  devices: DeviceResult[];
  isCollapsed: boolean;
  onToggle: () => void;
}

const SystemGroupHeader: React.FC<SystemGroupHeaderProps> = ({
  systemName,
  devices,
  isCollapsed,
  onToggle,
}) => {
  const activeCount =
    devices.filter((d) => d.device_status?.toLowerCase() === "active").length ||
    0;
  const inactiveCount =
    devices.filter((d) => d.device_status?.toLowerCase() === "inactive")
      .length || 0;

  return (
    <div className="bg-primary px-4 py-3 border-b border-border-primary flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1 hover:bg-secondary/50 bg-secondary/50 cursor-pointer rounded transition-colors"
        >
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-text-primary" />
          )}
        </button>
        <div>
          <h3 className="text-lg font-normal text-text-primary font-roboto">
            {systemName}
          </h3>
          <p className="text-sm text-text-secondary font-roboto">
            {devices.length} device{devices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-success rounded-full"></div>
            <span className="text-xs text-text-secondary font-roboto">
              {activeCount} Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-danger rounded-full"></div>
            <span className="text-xs text-text-secondary font-roboto">
              {inactiveCount} Inactive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemGroupHeader;
