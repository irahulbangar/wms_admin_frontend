import { useState, useRef, useEffect } from "react";
import { X, Copy, Check, Search } from "lucide-react";
import { Success, Error } from "../../../../utils/toast";
import type { DeviceResult } from "../../../../../model/devices.interface";

interface DevicePathItem {
  path: string;
  device: DeviceResult;
}

interface DevicePathListProps {
  systemDevices: DeviceResult[];
  reportFormula?: string;
  onPathSelect?: (path: string) => void;
}

const DevicePathList: React.FC<DevicePathListProps> = ({
  systemDevices,
  reportFormula: _reportFormula,
  onPathSelect: _onPathSelect,
}) => {
  const [devicePathSearchTerm, setDevicePathSearchTerm] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [copiedPathIndex, setCopiedPathIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const getAllSystemDevicePaths = (): DevicePathItem[] => {
    if (!systemDevices || systemDevices.length === 0) return [];

    return systemDevices
      .filter((device) => {
        const isVirtual =
          device.device_family_type === "virtual" ||
          device.device_family?.toLowerCase().includes("virtual");
        return !isVirtual;
      })
      .map((device) => {
        const deviceName = device.device_id || "";

        return {
          path: `devices['${deviceName}']`,
          device: device,
        };
      })
      .filter((item): item is DevicePathItem => item !== null);
  };

  const getDeviceVariables = (device: DeviceResult | null): string[] => {
    if (!device || !device.last_record) return [];
    const lastRecord = device.last_record as Record<string, any>;
    return Object.keys(lastRecord).filter(
      (key) => lastRecord?.[key] !== null && lastRecord?.[key] !== undefined
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let clickedInside = false;

      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setOpenDropdownIndex(null);
      }
    };

    if (openDropdownIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDropdownIndex]);

  const devicePaths = getAllSystemDevicePaths();
  const filteredPaths = devicePaths.filter((item) =>
    devicePathSearchTerm
      ? item.path.toLowerCase().includes(devicePathSearchTerm.toLowerCase())
      : true
  );

  return (
    <div className="mb-2 p-2 bg-secondary/50 rounded-lg border border-border-primary">
      <div className="flex items-center justify-between mb-2">
        <p className="text-base text-text-secondary font-roboto">
          Available System Devices
        </p>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search device paths..."
            value={devicePathSearchTerm}
            onChange={(e) => setDevicePathSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          />
          {devicePathSearchTerm && (
            <button
              type="button"
              onClick={() => setDevicePathSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filteredPaths.map((item, index) => {
          const originalIndex = devicePaths.findIndex(
            (p) =>
              p.path === item.path &&
              p.device.device_id === item.device.device_id
          );
          const deviceVariables = getDeviceVariables(item.device);
          const hasVariables = deviceVariables.length > 0;

          return (
            <div
              key={index}
              className="flex items-center gap-2 py-1 px-2 hover:bg-primary/50 rounded group relative"
            >
              <span className="text-xs text-text-secondary font-roboto min-w-[20px]">
                {index + 1}.
              </span>
              <code
                className="flex-1 text-xs text-text-primary font-mono cursor-pointer"
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest("button") ||
                    (e.target as HTMLElement).closest(".variable-dropdown")
                  ) {
                    return;
                  }
                  setOpenDropdownIndex(
                    openDropdownIndex === originalIndex ? null : originalIndex
                  );
                }}
                title="Click to open variable dropdown"
              >
                {item.path}
              </code>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdownIndex(
                      openDropdownIndex === originalIndex ? null : originalIndex
                    );
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="opacity-70 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary rounded"
                  title="Copy path with variable"
                >
                  {copiedPathIndex === originalIndex &&
                  openDropdownIndex !== originalIndex ? (
                    <Check className="w-4 h-4 text-status-success cursor-pointer" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-secondary hover:text-text-primary cursor-pointer" />
                  )}
                </button>
                {openDropdownIndex === originalIndex && (
                  <div
                    ref={(el) => {
                      if (el) {
                        dropdownRefs.current[originalIndex] = el;
                      } else {
                        delete dropdownRefs.current[originalIndex];
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-50 w-[490px] max-h-64 overflow-y-auto variable-dropdown"
                  >
                    <div className="p-2 border-b border-border-primary sticky top-0 bg-primary">
                      <p className="text-sm text-text-secondary font-roboto font-normal">
                        Select Variable
                      </p>
                    </div>
                    {hasVariables ? (
                      <>
                        <div
                          className="px-3 py-2 text-xs text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              await navigator.clipboard.writeText(item.path);
                              setCopiedPathIndex(originalIndex);
                              setTimeout(() => {
                                setCopiedPathIndex(null);
                              }, 2000);
                              setOpenDropdownIndex(null);
                              Success("Path copied to clipboard!");
                            } catch {
                              Error("Failed to copy path");
                            }
                          }}
                        >
                          <span className="font-mono text-xs">{item.path}</span>
                          <span className="text-text-secondary ml-2 text-[10px]">
                            (path only)
                          </span>
                        </div>
                        {deviceVariables.map((variable) => {
                          const lastRecord = item.device.last_record as Record<
                            string,
                            any
                          >;
                          const variableValue = lastRecord?.[variable];
                          const pathWithVariable = `${item.path}['${variable}']`;

                          return (
                            <div
                              key={variable}
                              className="px-3 py-2 text-xs text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await navigator.clipboard.writeText(
                                    pathWithVariable
                                  );
                                  setCopiedPathIndex(originalIndex);
                                  setTimeout(() => {
                                    setCopiedPathIndex(null);
                                  }, 2000);
                                  setOpenDropdownIndex(null);
                                  Success(
                                    "Path with variable copied to clipboard!"
                                  );
                                } catch {
                                  Error("Failed to copy path");
                                }
                              }}
                            >
                              <div className="font-mono text-xs mb-1">
                                {pathWithVariable}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-text-secondary">
                                <span className="font-semibold">
                                  {variable}:
                                </span>
                                <span className="ml-2">
                                  {variableValue !== null &&
                                  variableValue !== undefined
                                    ? String(variableValue)
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div
                        className="px-3 py-2 text-xs text-text-primary hover:bg-secondary cursor-pointer"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(item.path);
                            setCopiedPathIndex(originalIndex);
                            setTimeout(() => {
                              setCopiedPathIndex(null);
                            }, 2000);
                            setOpenDropdownIndex(null);
                            Success("Path copied to clipboard!");
                          } catch {
                            Error("Failed to copy path");
                          }
                        }}
                      >
                        <span className="font-mono text-xs">{item.path}</span>
                        <div className="text-text-secondary text-[10px] mt-1">
                          No variables available
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredPaths.length === 0 && (
          <div className="text-center py-4 text-xs text-text-secondary font-roboto">
            No device paths found matching "{devicePathSearchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicePathList;
