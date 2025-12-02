import { useState } from "react";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { FmDeviceResultItem } from "../../../../../model/fm-device.interface";

type TabType = "runtime" | "custom";
type ReportType = "daily" | "15 min" | "hour";

const FMReport: React.FC = () => {
  const { device_id, plant_id } = useParams<{
    device_id: string;
    plant_id: string;
  }>();
  const navigate = useNavigate();

  const deviceId = device_id ? parseInt(device_id) : 0;
  const _plantId = plant_id ? parseInt(plant_id) : 0;
  const [activeTab, setActiveTab] = useState<TabType>("runtime");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<FmDeviceResultItem[]>([]);

  const [runtimeDate, setRuntimeDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [reportType, setReportType] = useState<ReportType>("daily");
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetchFmDeviceData({
      //   deviceId,
      //   plantId: _plantId,
      //   ...(activeTab === "runtime" ? { date: runtimeDate } : { reportType, fromDate, toDate })
      // });
      // setReportData(response.data);

      // Mock data for now
      setTimeout(() => {
        setReportData([]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (reportData.length === 0) return;

    const headers = [
      "ID",
      "Device ID",
      "Interval Start",
      "Interval End",
      "Min",
      "Max",
      "Avg",
      "Flow",
      "From Time",
      "To Time",
    ];

    const csvContent = [
      headers.join(","),
      ...reportData.map((item) =>
        [
          item.id,
          item.device_id,
          item.interval_start,
          item.interval_end,
          item.min,
          item.max,
          item.avg,
          item.flow,
          item.from_time,
          item.to_time,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `fm-report-${deviceId}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between border-b border-border-primary pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-lg transition-all duration-200 cursor-pointer font-roboto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Devices</span>
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-border-primary pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("runtime")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer font-roboto ${
                activeTab === "runtime"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-text-secondary hover:text-text-primary bg-secondary"
              }`}
            >
              <span>RunTime</span>
            </button>
            <button
              onClick={() => setActiveTab("custom")}
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
      </div>

      <div className="flex flex-col gap-4 bg-primary rounded-lg p-4">
        {activeTab === "runtime" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto">
                  Date
                </label>
                <input
                  type="date"
                  value={runtimeDate}
                  onChange={(e) => setRuntimeDate(e.target.value)}
                  className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto"
                />
              </div>
              <div className="flex items-end">
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-base text-left rtl:text-right text-text-primary min-w-[1000px]">
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
                      Flow (m³/h)
                    </th>
                    <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                      Totalizer (ltr)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-8 text-center text-text-secondary font-roboto"
                      >
                        No data available. Click "Get Data" to fetch report.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-border-primary bg-primary hover:bg-primary/50"
                      >
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.from_time}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.to_time}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.flow}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.max}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custom Report Section */}
        {activeTab === "custom" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-roboto">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto cursor-pointer"
                >
                  <option value="daily">Daily</option>
                  <option value="15 min">15 Min</option>
                  <option value="hour">Hour</option>
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
              <div className="flex items-end gap-2">
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
                  disabled={reportData.length === 0 || isLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left rtl:text-right text-text-primary min-w-[1000px]">
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
                      Flow (m³/h)
                    </th>
                    <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                      Totalizer (ltr)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-8 text-center text-text-secondary font-roboto"
                      >
                        No data available. Click "Get Data" to fetch report.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-border-primary bg-primary hover:bg-primary/50"
                      >
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.from_time}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.to_time}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.flow}
                        </td>
                        <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                          {item.max}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FMReport;
