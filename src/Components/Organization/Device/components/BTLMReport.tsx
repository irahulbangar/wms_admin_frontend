import { useState, useEffect, useMemo } from "react";
import { Download, Loader2, Home, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import type { TankDeviceResultItem } from "../../../../../model/tank-device.interface";
import { useAppSelector } from "../../../../../store/store";
import {
  getDeviceById,
  getBTLMRuntimeData,
  getBTLMCustomReportData,
} from "../../../../../store/deviceSlice";
import { useAppDispatch } from "../../../../../store/store";
import type { DeviceResult } from "../../../../../model/devices.interface";
import Pagination from "../../../Pagination";
import { formatDateForCSV } from "../../../../utils/utils";
import { useDeviceReportBreadcrumb } from "./hooks/useDeviceReportBreadcrumb";
import {
  getOneWeekAgoDate,
  getTodayDate,
  reportTypeDurationMap,
} from "./utils/reportUtils";

type TabType = "runtime" | "custom";
type ReportType = "1day" | "15min" | "1hour";

const BTLMReport: React.FC = () => {
  const { plant_id, device_id } = useParams<{
    plant_id: string;
    device_id: string;
  }>();
  const dispatch = useAppDispatch();
  const { devices } = useAppSelector((state) => state.device);

  const _plantId = plant_id ? parseInt(plant_id) : 0;
  const deviceId = device_id ? parseInt(device_id) : 0;
  const [activeTab, setActiveTab] = useState<TabType>("runtime");
  const [isLoading, setIsLoading] = useState(false);
  const [runtimeReportData, setRuntimeReportData] = useState<
    TankDeviceResultItem[]
  >([]);
  const [customReportData, setCustomReportData] = useState<
    TankDeviceResultItem[]
  >([]);
  const [device, setDevice] = useState<DeviceResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = useMemo(() => {
    return activeTab === "runtime"
      ? runtimeReportData.length
      : customReportData.length;
  }, [activeTab, runtimeReportData, customReportData]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalItems, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handlePaginatedRuntimeReportData = useMemo(() => {
    return runtimeReportData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [runtimeReportData, currentPage, rowsPerPage]);

  const handlePaginatedCustomReportData = useMemo(() => {
    return customReportData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [customReportData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (deviceId) {
      const foundDevice = devices.find((d) => d.device_id === deviceId);
      if (foundDevice) {
        setDevice(foundDevice);
      } else {
        dispatch(getDeviceById(deviceId))
          .unwrap()
          .then((res) => {
            if (res.success && res.data && res.data.length > 0) {
              setDevice(res.data[0]);
            }
          })
          .catch((err) => {
            console.error("Error fetching device:", err);
          });
      }
    }
  }, [deviceId, devices, dispatch]);

  const [runtimeDate, setRuntimeDate] = useState<string>(getTodayDate());

  const [reportType, setReportType] = useState<ReportType>("1day");
  const [fromDate, setFromDate] = useState<string>(getOneWeekAgoDate());
  const [toDate, setToDate] = useState<string>(getTodayDate());

  const handleGetData = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    try {
      if (activeTab === "runtime") {
        await dispatch(
          getBTLMRuntimeData({
            plantId: _plantId,
            deviceId,
            date: runtimeDate,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success && res.data && res.data.length > 0) {
              setRuntimeReportData(res.data);
            } else {
              setRuntimeReportData([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching runtime report data:", err);
            setRuntimeReportData([]);
          });
      } else {
        await dispatch(
          getBTLMCustomReportData({
            plantId: _plantId,
            deviceId,
            from_date: fromDate,
            to_date: toDate,
            duration: reportTypeDurationMap[reportType],
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success && res.data && res.data.length > 0) {
              setCustomReportData(res.data);
            } else {
              setCustomReportData([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching custom report data:", err);
            setCustomReportData([]);
          });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const dataToExport =
      activeTab === "runtime" ? runtimeReportData : customReportData;
    if (dataToExport.length === 0) return;

    const headers = [
      "SR No",
      "From Time",
      "To Time",
      "First Level",
      "Last Level",
      "Min Level",
      "Max Level",
    ];

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((item, index) => {
        return [
          index + 1,
          formatDateForCSV(item.from_time),
          formatDateForCSV(item.to_time),
          item.first_level,
          item.last_level,
          item.min_level,
          item.max_level,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `btlm-${activeTab}-report-${deviceId}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    handleBackToHome,
    handleBackToOrganizations,
    handleBackToPlants,
    handleBackToDepartments,
    handleBackToSystems,
    handleBackToDevices,
  } = useDeviceReportBreadcrumb(device);

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden h-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <ChevronRight className="w-4 h-4 text-text-muted" />

          <button
            onClick={handleBackToOrganizations}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span>Organization</span>
          </button>

          <ChevronRight className="w-4 h-4 text-text-muted" />
          <button
            onClick={handleBackToPlants}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span>Plants</span>
          </button>

          <ChevronRight className="w-4 h-4 text-text-muted" />
          <button
            onClick={handleBackToDepartments}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span>Departments</span>
          </button>

          <ChevronRight className="w-4 h-4 text-text-muted" />
          <button
            onClick={handleBackToSystems}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span>Systems</span>
          </button>

          {device?.system_id && (
            <>
              <ChevronRight className="w-4 h-4 text-text-muted" />
              <button
                onClick={handleBackToDevices}
                className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
              >
                <span>Devices</span>
              </button>
            </>
          )}

          {device?.device_name && (
            <>
              <ChevronRight className="w-4 h-4 text-text-muted" />
              <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
                {device.device_name}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
              <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
                BTLM Report
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => {
              setActiveTab("runtime");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer font-roboto ${
              activeTab === "runtime"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-text-secondary hover:text-text-primary bg-secondary"
            }`}
          >
            <span>RunTime</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("custom");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer font-roboto ${
              activeTab === "custom"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-text-secondary hover:text-text-primary bg-secondary"
            }`}
          >
            <span>Custom Report</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 h-full">
        {activeTab === "runtime" && (
          <>
            <div className="flex items-center justify-end gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={runtimeDate}
                  onChange={(e) => setRuntimeDate(e.target.value)}
                  className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto"
                />
              </div>
              <div className="flex items-end gap-4">
                <button
                  onClick={handleGetData}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Get Data"
                  )}
                </button>
                <button
                  onClick={handleDownloadCSV}
                  disabled={runtimeReportData.length === 0 || isLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-primary rounded-lg">
                <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
              </div>
            ) : (
              <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
                <div className="overflow-auto h-[calc(100vh-235px)] table-scrollbar pb-17">
                  <table
                    className={`w-full text-sm text-left rtl:text-right text-text-primary ${
                      handlePaginatedRuntimeReportData.length > 0
                        ? "h-auto"
                        : "h-full"
                    } min-w-[1000px]`}
                  >
                    <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                      <tr>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          SR No
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          From Time
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          To Time
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          Total Water Consumption(Start) (Ltr)
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          Total Water Consumption(End)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {handlePaginatedRuntimeReportData.length > 0 ? (
                        handlePaginatedRuntimeReportData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-b border-border-primary bg-primary hover:bg-primary/50"
                          >
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {formatDateForCSV(item.from_time)}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {formatDateForCSV(item.to_time)}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {item.first_level}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {item.last_level}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <span className="text-text-secondary font-roboto">
                                No data available.
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </div>
            )}
          </>
        )}

        {/* Custom Report Section */}
        {activeTab === "custom" && (
          <>
            <div className="flex items-center justify-end gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="px-3 w-48 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto cursor-pointer"
                >
                  <option value="15min">15 Min</option>
                  <option value="1hour">Hour</option>
                  <option value="1day">Daily</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto opacity-0">
                  Action
                </label>
                <button
                  onClick={handleGetData}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Get Data"
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-secondary font-roboto opacity-0">
                    Action
                  </label>
                  <button
                    onClick={handleDownloadCSV}
                    disabled={customReportData.length === 0 || isLoading}
                    className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-primary rounded-lg">
                <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
              </div>
            ) : (
              <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full pb-17">
                <div className="overflow-y-auto overflow-x-auto h-[calc(100vh-330px)] table-scrollbar">
                  <table
                    className={`w-full text-sm text-left rtl:text-right text-text-primary ${
                      handlePaginatedCustomReportData.length > 0
                        ? "h-auto"
                        : "h-full"
                    } min-w-[1000px]`}
                  >
                    <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                      <tr>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          SR No
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          From Time
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          To Time
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          Total Water Consumption(Start) (Ltr)
                        </th>
                        <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                          Total Water Consumption(End)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {handlePaginatedCustomReportData.length > 0 ? (
                        handlePaginatedCustomReportData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-b border-border-primary bg-primary hover:bg-primary/50"
                          >
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {formatDateForCSV(item.from_time)}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {formatDateForCSV(item.to_time)}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {item.first_level}
                            </td>
                            <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                              {item.last_level}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <span className="text-text-secondary font-roboto">
                                No data available.
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BTLMReport;
