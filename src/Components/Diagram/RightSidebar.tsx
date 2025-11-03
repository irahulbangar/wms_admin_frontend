import React, { useEffect, useState } from "react";
import { X, Package, ChevronDown, ChevronRight, ChartArea } from "lucide-react";
import PieChart from "./PieChart";
import type { PieChartData } from "./PieChart";
import type {
  PlantCalculations,
  DepartmentCalculations,
  SystemCalculations,
} from "./utils/diagramCalculations";
import type { DeviceResult } from "../../../model/devices.interface";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: {
    id: string;
    name: string;
    type: "plant" | "department" | "system";
  } | null;
  calculations:
    | PlantCalculations
    | DepartmentCalculations
    | SystemCalculations
    | null;
  deviceData?: DeviceResult[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  selectedGroup,
  calculations,
  deviceData,
}) => {
  const [isFlowSummaryExpanded, setIsFlowSummaryExpanded] = useState(true);
  const [isStorageExpanded, setIsStorageExpanded] = useState(true);
  const [isWaterBalanceExpanded, setIsWaterBalanceExpanded] = useState(true);

  const getGroupId = (): number | null => {
    if (!selectedGroup || !deviceData) return null;

    switch (selectedGroup.type) {
      case "plant": {
        const plantName = selectedGroup.id.replace("plant-", "");
        const plantDevice = deviceData.find(
          (device) =>
            device.plant_name === plantName ||
            device.in_plant_name === plantName ||
            device.out_plant_name === plantName
        );
        return (
          plantDevice?.plant_id ||
          plantDevice?.in_plant_id ||
          plantDevice?.out_plant_id ||
          null
        );
      }
      case "department": {
        const deptId = parseInt(selectedGroup.id.replace("dept-", ""));
        return isNaN(deptId) ? null : deptId;
      }
      case "system": {
        const sysId = parseInt(selectedGroup.id.replace("system-", ""));
        return isNaN(sysId) ? null : sysId;
      }
      default:
        return null;
    }
  };

  const getFilteredStorageData = () => {
    if (!deviceData || !selectedGroup) {
      return { totalStock: 0, totalCapacity: 0 };
    }

    let filteredDevices: DeviceResult[] = [];
    const groupId = getGroupId();

    if (!groupId) {
      return { totalStock: 0, totalCapacity: 0 };
    }

    if (selectedGroup.type === "plant") {
      filteredDevices = deviceData.filter(
        (device) =>
          device.in_plant_id === groupId || device.out_plant_id === groupId
      );
    } else if (selectedGroup.type === "department") {
      const departmentDevices = deviceData.filter(
        (device) =>
          device.in_department_id === groupId ||
          device.out_department_id === groupId
      );
      filteredDevices = departmentDevices.filter(
        (device) => device.in_department_id || device.out_department_id
      );
    } else if (selectedGroup.type === "system") {
      const systemDevices = deviceData.filter(
        (device) =>
          device.in_system_id === groupId || device.out_system_id === groupId
      );
      filteredDevices = systemDevices.filter(
        (device) => device.in_system_id || device.out_system_id
      );
    }

    const tankDevices = filteredDevices.filter(
      (device) =>
        device.device_family_type === "tank" ||
        device.device_family?.toLowerCase().includes("tank")
    );

    const totals = tankDevices.reduce(
      (acc, device) => {
        const currentLevel = Number(device.last_record?.last_level) || 0;
        const capacity = Number(device?.params?.storageCapacity) || 0;

        return {
          totalStock: acc.totalStock + currentLevel,
          totalCapacity: acc.totalCapacity + capacity,
        };
      },
      { totalStock: 0, totalCapacity: 0 }
    );

    return totals;
  };

  const getDeviceValue = (device: DeviceResult) => {
    let value = 0;
    switch (device.device_family_type) {
      case "fm":
      case "brwhms":
        value = Number(device.last_record?.max) || 0;
        break;
      case "phmc":
        if (
          device.device_type === "New phmc" &&
          device.device_family_type === "phmc"
        ) {
          value = Number(device.last_record?.flowrate) || 0;
        } else {
          value = 0;
        }
        break;
      case "arg":
        value = Number(device.last_record?.max_mm) || 0;
        break;
      default:
        value = 0;
    }

    return value || 0;
  };

  const getWaterBalanceData = () => {
    if (!deviceData || !selectedGroup) {
      return [];
    }

    const allReportTypes = [
      "Flow In",
      "Flow Out",
      "Percolation",
      "Evaporation",
      "Consumption",
      "Wastage",
      "Regeneration",
      "Re-use",
      "Net Balance",
    ];

    const inReportType = ["In", "Evaporation", "Consumption", "Wastage"];
    const outReportType = ["Out", "Percolation", "Regeneration", "Re-use"];

    const groupId = getGroupId();
    if (!groupId) {
      return [];
    }

    const groupType = selectedGroup.type as "system" | "department" | "plant";

    const reportTypeTotals = allReportTypes.map((reportType) => {
      let total = 0;

      if (reportType === "Flow In") {
        total = deviceData
          .filter((device) => {
            let hasInConnection = false;
            if (device.report_type_name === "Flow") {
              switch (groupType) {
                case "system":
                  hasInConnection = device.in_system_id === groupId;
                  break;
                case "department":
                  hasInConnection = device.in_department_id === groupId;
                  break;
                case "plant":
                  hasInConnection = device.in_plant_id === groupId;
                  break;
              }
            }
            return hasInConnection;
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
      } else if (reportType === "Flow Out") {
        total = deviceData
          .filter((device) => {
            let hasOutConnection = false;
            if (device.report_type_name === "Flow") {
              switch (groupType) {
                case "system":
                  hasOutConnection = device.out_system_id === groupId;
                  break;
                case "department":
                  hasOutConnection = device.out_department_id === groupId;
                  break;
                case "plant":
                  hasOutConnection = device.out_plant_id === groupId;
                  break;
              }
            }
            return hasOutConnection;
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
      } else if (reportType === "Net Balance") {
        let inTotal = 0;
        let outTotal = 0;
        inTotal = deviceData
          .filter((device) => {
            switch (groupType) {
              case "system":
                return (
                  device.in_system_id === groupId &&
                  (inReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
              case "department":
                return (
                  device.in_department_id === groupId &&
                  (inReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
              case "plant":
                return (
                  device.in_plant_id === groupId &&
                  (inReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
        outTotal = deviceData
          .filter((device) => {
            switch (groupType) {
              case "system":
                return (
                  device.out_system_id === groupId &&
                  (outReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
              case "department":
                return (
                  device.out_department_id === groupId &&
                  (outReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
              case "plant":
                return (
                  device.out_plant_id === groupId &&
                  (outReportType.includes(device.report_type_name) ||
                    device.report_type_name === "Flow")
                );
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
        total = outTotal - inTotal;
      } else {
        total = deviceData
          .filter((device) => {
            if (device.report_type_name === reportType) {
              switch (groupType) {
                case "system":
                  return inReportType.includes(reportType)
                    ? device.in_system_id === groupId
                    : outReportType.includes(reportType)
                    ? device.out_system_id === groupId
                    : false;
                case "department":
                  return inReportType.includes(reportType)
                    ? device.in_department_id === groupId
                    : outReportType.includes(reportType)
                    ? device.out_department_id === groupId
                    : false;
                case "plant":
                  return inReportType.includes(reportType)
                    ? device.in_plant_id === groupId
                    : outReportType.includes(reportType)
                    ? device.out_plant_id === groupId
                    : false;
              }
            }
            return false;
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
      }

      return {
        reportType,
        total,
      };
    });

    return reportTypeTotals;
  };

  const getReportTypeColor = (reportType: string) => {
    const colors: Record<string, string> = {
      "Flow In": "#3B82F6",
      "Flow Out": "#10B981",
      Percolation: "#0ca9df",
      Evaporation: "#505472",
      Consumption: "#EF4444",
      Wastage: "#8B5CF6",
      Regeneration: "#fe994e",
      "Re-use": "#84CC16",
      "Net Balance": "#6B7280",
      Unknown: "#6B7280",
    };
    return colors[reportType] || "#6B7280";
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const getFlowSummaryChartData = (): PieChartData[] => {
    if (!calculations) return [];

    return [
      {
        name: "Total In",
        value: calculations.totalIn,
        color: "#3B82F6",
      },
      {
        name: "Total Out",
        value: calculations.totalOut,
        color: "#10B981",
      },
    ];
  };

  const getWaterBalanceChartData = (): PieChartData[] => {
    const balanceData = getWaterBalanceData();

    return balanceData
      .filter((item) => item.total > 0 && item.reportType !== "Net Balance")
      .map((item) => ({
        name: item.reportType,
        value: item.total,
        color: getReportTypeColor(item.reportType),
      }));
  };

  const getStorageChartData = (): PieChartData[] => {
    const filteredStorageData = getFilteredStorageData();
    const availableStock =
      filteredStorageData.totalCapacity - filteredStorageData.totalStock;

    return [
      {
        name: "Current Stock",
        value: filteredStorageData.totalStock,
        color: "#8B5CF6",
      },
      {
        name: "Available Stock",
        value: availableStock,
        color: "#3B82F6",
      },
    ];
  };

  if (!isOpen || !selectedGroup) {
    return null;
  }

  if (!calculations) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}

        <div
          className={`fixed right-0 top-0 h-full w-80 sm:w-96 bg-primary shadow-2xl border-l border-border-primary z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary bg-primary">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedGroup?.type === "plant"
                    ? "bg-status-info"
                    : selectedGroup?.type === "department"
                    ? "bg-status-success"
                    : "bg-status-warning"
                }`}
              ></div>
              <div>
                <h2 className="text-lg font-medium font-roboto text-text-primary">
                  {selectedGroup?.name}
                </h2>
                <p className="text-xs text-text-secondary capitalize">
                  {selectedGroup?.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-border-primary rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">
                  Loading calculations...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-80 sm:w-85 bg-primary shadow-2xl border-l border-border-primary z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-primary bg-primary">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                selectedGroup?.type === "plant"
                  ? "bg-status-info"
                  : selectedGroup?.type === "department"
                  ? "bg-status-success"
                  : "bg-status-warning"
              }`}
            ></div>
            <div>
              <h2
                className="text-lg font-medium text-text-primary truncate max-w-[250px]"
                title={selectedGroup?.name}
              >
                {selectedGroup?.name}
              </h2>
              <p className="text-xs text-text-secondary capitalize">
                {selectedGroup?.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-border-primary rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-[100px]">
          <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
            <div
              className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setIsFlowSummaryExpanded(!isFlowSummaryExpanded)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium font-roboto text-text-primary flex items-center gap-2 capitalize">
                  <ChartArea className="w-5 h-5" />
                  {selectedGroup?.type} Flow Analysis
                </h3>
                {isFlowSummaryExpanded ? (
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                )}
              </div>
            </div>

            {isFlowSummaryExpanded && (
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center flex-col gap-2">
                    <PieChart
                      data={getFlowSummaryChartData()}
                      title={selectedGroup?.name}
                      height={200}
                      noDataMessage="No Flow Data Available"
                      tooltipFormatter={(params: any) => {
                        const name = params.name;
                        const value = params.value;
                        const percentage = params.percent;
                        return `${name} ${value.toFixed(
                          1
                        )} Ltr (${percentage}%)`;
                      }}
                    />
                    <div className="flex items-center gap-1 w-full flex-wrap">
                      {getFlowSummaryChartData().map((item: any) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="w-4 h-2 rounded-sm"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs font-roboto text-text-secondary">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-border-primary rounded-lg">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border-primary">
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-status-info rounded-full"></div>
                            Total In
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {calculations?.totalIn?.toFixed(1)}{" "}
                            <span className="italic text-text-secondary font-roboto">
                              Ltr
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-status-success rounded-full"></div>
                            Total Out
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {calculations?.totalOut?.toFixed(1)}{" "}
                            <span className="italic text-text-secondary font-roboto">
                              Ltr
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {calculations.totalBalance >= 0 ? (
                              <div className="w-3.5 h-3.5 bg-status-success rounded-full"></div>
                            ) : (
                              <div className="w-3.5 h-3.5 bg-status-danger rounded-full"></div>
                            )}
                            Balance
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {calculations?.totalBalance?.toFixed(1)}{" "}
                            <span className="italic text-text-secondary font-roboto">
                              Ltr
                            </span>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {(() => {
            const filteredStorageData = getFilteredStorageData();
            return (
              (filteredStorageData.totalStock > 0 ||
                filteredStorageData.totalCapacity > 0) && (
                <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
                  <div
                    className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setIsStorageExpanded(!isStorageExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium font-roboto text-text-primary flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span className="capitalize">
                          {selectedGroup?.type} Storage Analysis
                        </span>
                      </h3>
                      {isStorageExpanded ? (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                  </div>

                  {isStorageExpanded && (
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="flex items-center flex-col gap-2">
                          <PieChart
                            data={getStorageChartData()}
                            title={selectedGroup?.name}
                            height={200}
                            noDataMessage={`${selectedGroup?.name} Storage Data Not Available`}
                            tooltipFormatter={(params: any) => {
                              const name = params.name;
                              const value = params.value;
                              const percentage = params.percent;
                              return `${name} ${value.toFixed(
                                1
                              )} Ltr (${percentage}%)`;
                            }}
                          />
                          <div className="flex items-center gap-1 w-full flex-wrap">
                            {getStorageChartData().map((item: any) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className="w-4 h-2 rounded-sm"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-xs font-roboto text-text-secondary">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-border-primary rounded-lg">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-border-primary">
                            <tr className="hover:bg-secondary/10">
                              <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#8B5CF6] rounded-full"></div>
                                  Total Stock
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-text-primary text-sm font-roboto">
                                  {filteredStorageData.totalStock.toFixed(1)}{" "}
                                  <span className="italic text-text-secondary font-roboto">
                                    Ltr
                                  </span>
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-secondary/10">
                              <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#3B82F6] rounded-full"></div>
                                  Available Capacity
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-text-primary text-sm font-roboto">
                                  {(
                                    filteredStorageData.totalCapacity -
                                    filteredStorageData.totalStock
                                  ).toFixed(1)}{" "}
                                  <span className="italic text-text-secondary font-roboto">
                                    Ltr
                                  </span>
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-secondary/10">
                              <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#06B6D4] rounded-full"></div>
                                  Total Capacity
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-text-primary text-sm font-roboto">
                                  {filteredStorageData.totalCapacity.toFixed(1)}{" "}
                                  <span className="italic text-text-secondary font-roboto">
                                    Ltr
                                  </span>
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            );
          })()}

          {deviceData && selectedGroup && (
            <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
              <div
                className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() =>
                  setIsWaterBalanceExpanded(!isWaterBalanceExpanded)
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium font-roboto text-text-primary flex items-center gap-2">
                    <ChartArea className="w-5 h-5" />
                    <span className="capitalize">
                      {selectedGroup?.type} Water Balance Analysis
                    </span>
                  </h3>
                  {isWaterBalanceExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
              </div>

              {isWaterBalanceExpanded && (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center flex-col gap-2">
                      <PieChart
                        data={getWaterBalanceChartData()}
                        title={selectedGroup?.name}
                        height={200}
                        noDataMessage="No Water Balance Data Available"
                        tooltipFormatter={(params: any) => {
                          const name = params.name;
                          const value = params.value;
                          const percentage = params.percent;
                          return `${name}: ${value.toFixed(
                            1
                          )} Ltr (${percentage}%)`;
                        }}
                      />
                      <div className="flex items-center gap-1 w-full flex-wrap">
                        {getWaterBalanceChartData().map((item: any) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-1"
                          >
                            <div
                              className="w-4 h-2 rounded-sm"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs font-roboto text-text-secondary">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const balanceData = getWaterBalanceData();

                    if (balanceData.length === 0) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-sm text-text-secondary">
                            No water balance data available for this{" "}
                            {selectedGroup?.type}.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto border border-border-primary rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border-primary">
                              <th className="px-4 py-2 text-left text-text-secondary font-medium">
                                Report Type
                              </th>
                              <th className="px-4 py-2 text-right text-text-secondary font-medium">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-primary">
                            {balanceData
                              .filter((item) => {
                                if (item.reportType === "Net Balance") {
                                  const hasOtherData = balanceData.some(
                                    (other) =>
                                      other.reportType !== "Net Balance" &&
                                      other.total > 0
                                  );
                                  return hasOtherData;
                                }
                                return item.total > 0;
                              })
                              .map((item, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-secondary/10"
                                >
                                  <td className="px-4 py-3 text-text-secondary text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3.5 h-3.5 rounded-full"
                                        style={{
                                          backgroundColor: getReportTypeColor(
                                            item.reportType
                                          ),
                                        }}
                                      ></div>
                                      <span className="text-text-secondary text-sm font-roboto">
                                        {item.reportType}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3 text-right">
                                    <span className="text-text-primary text-sm font-roboto flex items-center gap-1">
                                      {item.total.toFixed(1)}{" "}
                                      <span className="italic text-text-secondary font-roboto">
                                        Ltr
                                      </span>
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
