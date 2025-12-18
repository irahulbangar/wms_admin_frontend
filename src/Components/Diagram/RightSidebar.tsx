import React, { useEffect, useState, useMemo } from "react";
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
  const totalBalance = useMemo(() => {
    if (!calculations) return 0;
    return calculations.totalIn - calculations.totalOut;
  }, [calculations]);

  const getGroupId = (): number | null => {
    if (!selectedGroup) return null;
    const groupId = parseInt(selectedGroup.id, 10);
    return isNaN(groupId) ? null : groupId;
  };
  const filteredDeviceData = useMemo(() => {
    if (!deviceData || !selectedGroup) {
      return [];
    }

    const groupId = parseInt(selectedGroup.id, 10);
    if (isNaN(groupId)) {
      return [];
    }

    let filtered: DeviceResult[] = [];

    if (selectedGroup.type === "plant") {
      filtered = deviceData.filter(
        (device) =>
          Number(device.plant_id) === groupId ||
          Number(device.in_plant_id) === groupId ||
          Number(device.out_plant_id) === groupId
      );
    } else if (selectedGroup.type === "department") {
      filtered = deviceData.filter(
        (device) =>
          Number(device.department_id) === groupId ||
          Number(device.in_department_id) === groupId ||
          Number(device.out_department_id) === groupId
      );
    } else if (selectedGroup.type === "system") {
      filtered = deviceData.filter(
        (device) =>
          Number(device.system_id) === groupId ||
          Number(device.in_system_id) === groupId ||
          Number(device.out_system_id) === groupId
      );
    }

    return filtered;
  }, [deviceData, selectedGroup]);

  const getFilteredStorageData = () => {
    if (!deviceData || !selectedGroup) {
      return { totalStock: 0, totalCapacity: 0 };
    }

    const groupId = parseInt(selectedGroup.id, 10);
    if (isNaN(groupId)) {
      return { totalStock: 0, totalCapacity: 0 };
    }

    let storageDevices: DeviceResult[] = [];

    if (selectedGroup.type === "plant") {
      storageDevices = deviceData.filter(
        (device) =>
          Number(device.in_plant_id) === groupId ||
          Number(device.out_plant_id) === groupId
      );
    } else if (selectedGroup.type === "department") {
      storageDevices = deviceData.filter(
        (device) =>
          Number(device.in_department_id) === groupId ||
          Number(device.out_department_id) === groupId
      );
    } else if (selectedGroup.type === "system") {
      storageDevices = deviceData.filter(
        (device) =>
          Number(device.in_system_id) === groupId ||
          Number(device.out_system_id) === groupId
      );
    }

    const tankDevices = storageDevices.filter(
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
    if (
      !filteredDeviceData ||
      filteredDeviceData.length === 0 ||
      !selectedGroup
    ) {
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
      "Rainfall",
      "Re-use",
      "Net Balance",
    ];

    const inReportType = ["In", "Rainfall", "Regeneration", "Re-use"];
    const outReportType = ["Out", "Evaporation", "Consumption", "Wastage", "Percolation"];

    const groupId = getGroupId();
    if (!groupId) {
      return [];
    }

    const groupType = selectedGroup.type as "system" | "department" | "plant";

    const reportTypeTotals = allReportTypes.map((reportType) => {
      let total = 0;

      if (reportType === "Flow In") {
        total = filteredDeviceData
          .filter((device) => {
            if (device.report_type_name !== "Flow") return false;

            switch (groupType) {
              case "system":
                return device.in_system_id === groupId;
              case "department":
                return device.in_department_id === groupId;
              case "plant":
                return device.in_plant_id === groupId;
              default:
                return false;
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
      } else if (reportType === "Flow Out") {
        total = filteredDeviceData
          .filter((device) => {
            if (device.report_type_name !== "Flow") return false;

            switch (groupType) {
              case "system":
                return device.out_system_id === groupId;
              case "department":
                return device.out_department_id === groupId;
              case "plant":
                return device.out_plant_id === groupId;
              default:
                return false;
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);
      } else if (reportType === "Net Balance") {
        let inTotal = 0;
        let outTotal = 0;

        inTotal = filteredDeviceData
          .filter((device) => {
            const isInReportType =
              inReportType.includes(device.report_type_name) ||
              device.report_type_name === "Flow";
            if (!isInReportType) return false;

            switch (groupType) {
              case "system":
                return device.in_system_id === groupId;
              case "department":
                return device.in_department_id === groupId;
              case "plant":
                return device.in_plant_id === groupId;
              default:
                return false;
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);

        outTotal = filteredDeviceData
          .filter((device) => {
            const isOutReportType =
              outReportType.includes(device.report_type_name) ||
              device.report_type_name === "Flow";
            if (!isOutReportType) return false;

            switch (groupType) {
              case "system":
                return device.out_system_id === groupId;
              case "department":
                return device.out_department_id === groupId;
              case "plant":
                return device.out_plant_id === groupId;
              default:
                return false;
            }
          })
          .reduce((sum, device) => sum + getDeviceValue(device), 0);

        total = inTotal - outTotal;
      } else {
        total = filteredDeviceData
          .filter((device) => {
            if (device.report_type_name !== reportType) return false;

            const isInType = inReportType.includes(reportType);
            const isOutType = outReportType.includes(reportType);

            switch (groupType) {
              case "system":
                if (isInType) {
                  return device.in_system_id === groupId;
                } else if (isOutType) {
                  return device.out_system_id === groupId;
                }
                return false;
              case "department":
                if (isInType) {
                  return device.in_department_id === groupId;
                } else if (isOutType) {
                  return device.out_department_id === groupId;
                }
                return false;
              case "plant":
                if (isInType) {
                  return device.in_plant_id === groupId;
                } else if (isOutType) {
                  return device.out_plant_id === groupId;
                }
                return false;
              default:
                return false;
            }
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
      "Flow In": "#5070de",
      "Flow Out": "#b6d733",
      Percolation: "#505472",
      Evaporation: "#fe994e",
      Consumption: "#0ca9df",
      Wastage: "#ffd209",
      Regeneration: "#fa6488",
      "Re-use": "#7a5db0",
      Rainfall: "#40bf96",
      "Net Balance": "#6B7280",
      Unknown: "#7da6d2",
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
        color: "#5070de",
      },
      {
        name: "Total Out",
        value: calculations.totalOut,
        color: "#b6d733",
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
        color: "#5070de",
      },
      {
        name: "Available Stock",
        value: availableStock,
        color: "#7da6d2",
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
                <h2 className="text-lg font-normal font-roboto text-text-primary">
                  {selectedGroup?.name}
                </h2>
                <p className="text-xs text-text-secondary capitalize font-roboto">
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
        className={`fixed right-0 top-0 h-full w-90 bg-primary shadow-2xl border-l border-border-primary z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-primary">
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
                className="text-lg font-normal font-roboto text-text-primary truncate max-w-[250px]"
                title={selectedGroup?.name}
              >
                {selectedGroup?.name}
              </h2>
              <p className="text-xs text-text-secondary capitalize font-roboto">
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
                <h3 className="text-lg font-normal font-roboto text-text-primary flex items-center gap-2 capitalize">
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
                    <div className="flex items-center justify-center gap-1 w-full flex-wrap">
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
                        <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-[#5070de] rounded-full"></div>
                            Total In
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {calculations?.totalIn?.toFixed(2)}{" "}
                            <span className="italic text-text-secondary font-roboto">
                              Ltr
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-[#b6d733] rounded-full"></div>
                            Total Out
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {calculations?.totalOut?.toFixed(2)}{" "}
                            <span className="italic text-text-secondary font-roboto">
                              Ltr
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                          <div className="flex items-center gap-2">
                            {totalBalance >= 0 ? (
                              <div className="w-3.5 h-3.5 bg-[#6B7280] rounded-full"></div>
                            ) : (
                              <div className="w-3.5 h-3.5 bg-[#ee6666] rounded-full"></div>
                            )}
                            Balance
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-primary text-sm font-roboto">
                            {totalBalance.toFixed(2)}{" "}
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
                      <h3 className="text-lg font-normal font-roboto text-text-primary flex items-center space-x-2">
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
                          <div className="flex items-center justify-center gap-1 w-full flex-wrap">
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
                              <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#5070de] rounded-full"></div>
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
                              <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#7da6d2] rounded-full"></div>
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
                              <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 bg-[#73c0de] rounded-full"></div>
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
                  <h3 className="text-lg font-normal font-roboto text-text-primary flex items-center gap-2">
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
                      <div className="flex items-center justify-center gap-1 w-full flex-wrap">
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
                              <th className="px-4 py-2 text-left text-text-secondary font-normal font-roboto">
                                Report Type
                              </th>
                              <th className="px-4 py-2 text-center text-text-secondary font-normal font-roboto">
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
                                  <td className="px-4 py-3 text-text-secondary text-sm font-normal font-roboto">
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
                                  <td className="px-2 py-3 text-center">
                                    <span className="text-text-primary text-sm font-roboto flex items-center gap-1 justify-center">
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
