import React, { useEffect, useState, useRef } from "react";
import { X, Package, ChevronDown, ChevronRight, ChartArea } from "lucide-react";
import * as echarts from "echarts";
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
  const [isInConnectionExpanded, setIsInConnectionExpanded] = useState(true);
  const [isOutConnectionExpanded, setIsOutConnectionExpanded] = useState(true);

  const flowChartRef = useRef<HTMLDivElement>(null);
  const storageChartRef = useRef<HTMLDivElement>(null);
  const inConnectionChartRef = useRef<HTMLDivElement>(null);
  const outConnectionChartRef = useRef<HTMLDivElement>(null);

  const getFilteredStorageData = () => {
    if (!deviceData || !selectedGroup) {
      return { totalStock: 0, totalCapacity: 0 };
    }

    let filteredDevices: DeviceResult[] = [];

    if (selectedGroup.type === "plant") {
      filteredDevices = deviceData.filter(device => 
        device.in_plant_id || device.out_plant_id
      );
    } else if (selectedGroup.type === "department") {
      const departmentId = parseInt(selectedGroup.id.replace("dept-", ""));
      const departmentDevices = deviceData.filter(
        (device) => device.in_department_id === departmentId || device.out_department_id === departmentId
      );  
      filteredDevices = departmentDevices.filter(device => 
        device.in_department_id || device.out_department_id
      );
    } else if (selectedGroup.type === "system") {
      const systemId = parseInt(selectedGroup.id.replace("system-", ""));
      const systemDevices = deviceData.filter(
        (device) => device.in_system_id === systemId || device.out_system_id === systemId
      );
      filteredDevices = systemDevices.filter(device => 
        device.in_system_id || device.out_system_id
      );
    }

    const tankDevices = filteredDevices.filter(
      (device) => device.device_family_type === "tank" || device.device_family?.toLowerCase().includes("tank")
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

  useEffect(() => {
    if (
      flowChartRef.current &&
      isFlowSummaryExpanded &&
      calculations &&
      isOpen &&
      selectedGroup
    ) {
      const chart = echarts.init(flowChartRef.current);
      const option = getFlowSummaryChartOption();
      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    }
  }, [isFlowSummaryExpanded, calculations, isOpen, selectedGroup]);

  useEffect(() => {
    if (
      storageChartRef.current &&
      isStorageExpanded &&
      calculations &&
      "totalStock" in calculations &&
      isOpen &&
      selectedGroup
    ) {
      const chart = echarts.init(storageChartRef.current);
      const option = getStorageChartOption();
      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    }
  }, [isStorageExpanded, calculations, isOpen, selectedGroup]);

  useEffect(() => {
    if (
      inConnectionChartRef.current &&
      isInConnectionExpanded &&
      calculations &&
      'reportTypeCalculations' in calculations &&
      calculations.reportTypeCalculations &&
      isOpen &&
      selectedGroup
    ) {
      const chart = echarts.init(inConnectionChartRef.current);
      const option = getInConnectionChartOption();
      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    }
  }, [isInConnectionExpanded, calculations, isOpen, selectedGroup]);

  useEffect(() => {
    if (
      outConnectionChartRef.current &&
      isOutConnectionExpanded &&
      calculations &&
      'reportTypeCalculations' in calculations &&
      calculations.reportTypeCalculations &&
      isOpen &&
      selectedGroup
    ) {
      const chart = echarts.init(outConnectionChartRef.current);
      const option = getOutConnectionChartOption();
      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    }
  }, [isOutConnectionExpanded, calculations, isOpen, selectedGroup]);

  const getFlowSummaryChartOption = () => {
    if (!calculations) return {};

    const data = [
      {
        value: calculations.totalIn,
        name: "Total In",
        itemStyle: { color: "#3B82F6" },
      },
      {
        value: calculations.totalOut,
        name: "Total Out",
        itemStyle: { color: "#10B981" },
      },
    ].filter((item) => item.value > 0);

    if (data.length === 0) {
      return {
        title: {
          text: "No Data Available",
          left: "center",
          top: "center",
          textStyle: {
            color: "#374151",
            fontSize: 14,
          },
        },
        series: [],
      };
    }

    return {
      title: {
        text: `${selectedGroup?.name}`,
        left: "center",
        top: "10px",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#374151",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const name = params.name;
          const value = params.value;
          const percentage = params.percent;
          return `${name} ${value.toFixed(1)} Ltr (${percentage}%)`;
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#ccc",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      series: [
        {
          name: `${selectedGroup?.name} Flow Summary`,
          type: "pie",
          radius: "70%",
          center: ["50%", "55%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}",
            fontSize: 14,
            color: "#374151",
            fontWeight: "normal",
            distance: 15,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderColor: "#ccc",
            borderWidth: 0,
            borderRadius: 0,
            padding: [4, 8],
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            lineStyle: {
              color: "#999",
              width: 1,
            },
          },
          data: data,
        },
      ],
    };
  };

  const getReportTypeColor = (reportType: string): string => {
    const colorMap: Record<string, string> = {
      'Flow': '#3B82F6',
      'Percolation': '#10B981',
      'Evaporation': '#F59E0B',
      'Consumption': '#EF4444',
      'Wastage': '#8B5CF6',
      'Regeneration': '#06B6D4',
      'Re-use': '#84CC16',
    };
    
    return colorMap[reportType] || '#3B82F6';
  };

  const getInConnectionChartOption = () => {
    if (!calculations || !('reportTypeCalculations' in calculations) || !calculations.reportTypeCalculations) return {};

    const reportTypeCalculations = calculations.reportTypeCalculations as any[];
    const inData = reportTypeCalculations
      .filter((rt: any) => rt.totalIn > 0)
      .map((rt: any) => ({
        value: rt.totalIn,
        name: rt.reportType,
        itemStyle: { color: getReportTypeColor(rt.reportType) },
      }));

    if (inData.length === 0) {
      return {
        title: {
          text: "No IN Data Available",
          left: "center",
          top: "center",
          textStyle: {
            color: "#374151",
            fontSize: 14,
          },
        },
        series: [],
      };
    }

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const reportType = params.name;
          const value = params.value;
          const percentage = params.percent;
          return `${reportType}<br/>Value: ${value.toFixed(1)} Ltr<br/>Percentage: ${percentage}%`;
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#ccc",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      series: [
        {
          name: "IN Connection",
          type: "pie",
          radius: "70%",
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: inData,
        },
      ],
    };
  };

  const getOutConnectionChartOption = () => {
    if (!calculations || !('reportTypeCalculations' in calculations) || !calculations.reportTypeCalculations) return {};

    const reportTypeCalculations = calculations.reportTypeCalculations as any[];
    const outData = reportTypeCalculations
      .filter((rt: any) => rt.totalOut > 0)
      .map((rt: any) => ({
        value: rt.totalOut,
        name: rt.reportType,
        itemStyle: { color: getReportTypeColor(rt.reportType) },
      }));

    if (outData.length === 0) {
      return {
        title: {
          text: "No OUT Data Available",
          left: "center",
          top: "center",
          textStyle: {
            color: "#374151",
            fontSize: 14,
          },
        },
        series: [],
      };
    }

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const reportType = params.name;
          const value = params.value;
          const percentage = params.percent;
          return `${reportType}<br/>Value: ${value.toFixed(1)} Ltr<br/>Percentage: ${percentage}%`;
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#ccc",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      series: [
        {
          name: "OUT Connection",
          type: "pie",
          radius: "70%",
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: outData,
        },
      ],
    };
  };

  const getStorageChartOption = () => {
    const filteredStorageData = getFilteredStorageData();
    
    if (filteredStorageData.totalStock === 0 && filteredStorageData.totalCapacity === 0) {
      return {
        title: {
          text: `${selectedGroup?.name} Storage Data Not Available`,
          left: "center",
          top: "center",
          textStyle: {
            color: "#6B7280",
            fontSize: 14,
          },
        },
        series: [],
      };
    }

    const availableStock = filteredStorageData.totalCapacity - filteredStorageData.totalStock;
    const data = [
      {
        value: filteredStorageData.totalStock,
        name: "Current Stock",
        itemStyle: { color: "#8B5CF6" },
      },
      {
        value: availableStock,
        name: "Available Stock",
        itemStyle: { color: "#3B82F6" },
      },
    ].filter((item) => item.value > 0);

    if (data.length === 0) {
      return {
        title: {
          text: "No Storage Data",
          left: "center",
          top: "center",
          textStyle: {
            color: "#6B7280",
            fontSize: 14,
          },
        },
        series: [],
      };
    }

    return {
      title: {
        text: `${selectedGroup?.name}`,
        left: "center",
        top: "10px",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#374151",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const name = params.name;
          const value = params.value;
          const percentage = params.percent;
          return `${name} ${value.toFixed(1)} Ltr (${percentage}%)`;
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#ccc",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      series: [
        {
          name: `${selectedGroup?.name} Storage`,
          type: "pie",
          radius: "70%",
          center: ["50%", "55%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}",
            fontSize: 14,
            color: "#374151",
            fontWeight: "normal",
            distance: 15,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderColor: "#ccc",
            borderWidth: 0,
            borderRadius: 0,
            padding: [4, 8],
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            lineStyle: {
              color: "#999",
              width: 1,
            },
          },
          data: data,
        },
      ],
    };
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
              <h2 className="text-lg font-semibold text-text-primary">
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

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-[100px]">
          <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
            <div
              className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setIsFlowSummaryExpanded(!isFlowSummaryExpanded)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium font-roboto text-text-primary flex items-center gap-2">
                  <ChartArea className="w-5 h-5" />
                  Flow Summary
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
                  <div
                    ref={flowChartRef}
                    style={{ height: "200px", width: "100%" }}
                  />
                </div>

                <div className="overflow-x-auto border border-border-primary rounded-lg">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border-primary">
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-base font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-status-info rounded-full"></div>
                            Total In
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-text-primary text-base font-roboto">
                            {calculations.totalIn} Ltr
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-base font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-status-success rounded-full"></div>
                            Total Out
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-text-primary text-base font-roboto">
                            {calculations.totalOut} Ltr
                          </span>  
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary text-base font-medium">
                          <div className="flex items-center gap-2">
                            {calculations.totalBalance >= 0 ? (
                              <div className="w-3.5 h-3.5 bg-green-500 rounded-full"></div>
                            ) : (
                              <div className="w-3.5 h-3.5 bg-red-500 rounded-full"></div>
                            )}
                            Balance
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-text-primary text-base font-roboto">
                            {calculations.totalBalance} Ltr
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
            return (filteredStorageData.totalStock > 0 || filteredStorageData.totalCapacity > 0) && (
              <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
                <div
                  className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setIsStorageExpanded(!isStorageExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium font-roboto text-text-primary flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>Storage Information</span>
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
                      <div
                        ref={storageChartRef}
                        style={{ height: "200px", width: "100%" }}
                      />
                    </div>

                    <div className="overflow-x-auto border border-border-primary rounded-lg">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border-primary">
                          <tr className="hover:bg-secondary/10">
                            <td className="px-4 py-3 text-text-secondary text-base font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-[#8B5CF6] rounded-full"></div>
                                Total Stock
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-medium text-text-primary text-base font-roboto">
                                {filteredStorageData.totalStock.toFixed(1)} Ltr
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-secondary/10">
                            <td className="px-4 py-3 text-text-secondary text-base font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-[#3B82F6] rounded-full"></div>
                                Available Capacity
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-medium text-text-primary text-base font-roboto">
                                {(filteredStorageData.totalCapacity - filteredStorageData.totalStock).toFixed(1)} Ltr
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-secondary/10">
                            <td className="px-4 py-3 text-text-secondary text-base font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-[#06B6D4] rounded-full"></div>
                                  Total Capacity
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-medium text-text-primary text-base font-roboto">
                                {filteredStorageData.totalCapacity.toFixed(1)} Ltr
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {calculations && 'reportTypeCalculations' in calculations && calculations.reportTypeCalculations ? (
            <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
              <div
                className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setIsInConnectionExpanded(!isInConnectionExpanded)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium font-roboto text-text-primary flex items-center gap-2">
                    <ChartArea className="w-5 h-5" />
                    IN Connection Report Types & Calculations
                  </h3>
                  {isInConnectionExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
              </div>

              {isInConnectionExpanded && (
                <div className="p-4">
                  <div className="mb-4">
                    <div
                      ref={inConnectionChartRef}
                      style={{ height: "200px", width: "100%" }}
                    />
                  </div>

                  <div className="overflow-x-auto border border-border-primary rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-primary">
                          <th className="px-4 py-2 text-left text-text-secondary font-medium">Report Type</th>
                          <th className="px-4 py-2 text-right text-text-secondary font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-primary">
                        {(calculations.reportTypeCalculations as any[]).map((reportType: any) => (
                          <tr key={reportType.reportType} className="hover:bg-secondary/10">
                            <td className="px-4 py-3 text-text-secondary text-base font-medium">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3.5 h-3.5 rounded-full"
                                  style={{ backgroundColor: getReportTypeColor(reportType.reportType) }}
                                ></div>
                                {reportType.reportType}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-medium text-text-primary text-base font-roboto">
                                {reportType.totalIn > 0 ? `${reportType.totalIn.toFixed(1)} Ltr` : '0.0 Ltr'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {calculations && 'reportTypeCalculations' in calculations && calculations.reportTypeCalculations ? (
            <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
              <div
                className="bg-secondary/20 px-4 py-2 border-b border-border-primary cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setIsOutConnectionExpanded(!isOutConnectionExpanded)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium font-roboto text-text-primary flex items-center gap-2">
                    <ChartArea className="w-5 h-5" />
                    OUT Connection Report Types & Calculations
                  </h3>
                  {isOutConnectionExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
              </div>

              {isOutConnectionExpanded && (
                <div className="p-4">
                  <div className="mb-4">
                    <div
                      ref={outConnectionChartRef}
                      style={{ height: "200px", width: "100%" }}
                    />
                  </div>

                  <div className="overflow-x-auto border border-border-primary rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-primary">
                          <th className="px-4 py-2 text-left text-text-secondary font-medium">Report Type</th>
                          <th className="px-4 py-2 text-right text-text-secondary font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-primary">
                        {(calculations.reportTypeCalculations as any[]).map((reportType: any) => (
                          <tr key={reportType.reportType} className="hover:bg-secondary/10">
                            <td className="px-4 py-3 text-text-secondary text-base font-medium">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3.5 h-3.5 rounded-full"
                                  style={{ backgroundColor: getReportTypeColor(reportType.reportType) }}
                                ></div>
                                {reportType.reportType}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-medium text-text-primary text-base font-roboto">
                                {reportType.totalOut > 0 ? `${reportType.totalOut.toFixed(1)} Ltr` : '0.0 Ltr'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
