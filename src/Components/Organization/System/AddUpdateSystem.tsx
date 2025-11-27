import { X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store/store";
import { Error, Success } from "../../../utils/toast";
import {
  createSystem,
  getSystemById,
  updateSystem,
} from "../../../../store/systemSlice";
import { ApiError } from "../../../utils/errorHandler";
import { Editor } from "@monaco-editor/react";

interface AddUpdateSystemProps {
  setShowAddSystemPopup: (show: boolean) => void;
  type: "add" | "update";
  plantId: number;
  systemId?: number;
  onUpdateSuccess: () => void;
  organizationId: number;
  departmentId: number;
}

interface SystemReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
}

const AddUpdateSystem: React.FC<AddUpdateSystemProps> = ({
  setShowAddSystemPopup,
  type,
  plantId,
  systemId,
  departmentId,
  onUpdateSuccess,
  organizationId,
}) => {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState({
    system_name: "",
    system_info: "",
    status: "",
  });
  const [systemData, setSystemData] = useState({
    system_name: "",
    system_info: "",
    status: "",
    plant_id: plantId || 0,
    organization_id: organizationId || 0,
    department_id: departmentId || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<SystemReporting>({
    report_name: "",
    report_unit: "",
    report_formula: "",
    neutrality_formula: "",
  });

  const getSystemData = useCallback(() => {
    if (!systemId) return;

    setIsLoading(true);
    dispatch(getSystemById(systemId || 0))
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setSystemData({
            system_name: res.data?.system_name || "",
            system_info: res.data?.system_description || "",
            status: res.data?.status || "active",
            plant_id: res.data?.plant_id || plantId || 0,
            organization_id: res.data?.organization_id || organizationId || 0,
            department_id: res.data?.department_id || departmentId || 0,
          });
          if (res.data?.system_reporting) {
            setReportData({
              report_name: res.data?.system_reporting.report_name || "",
              report_unit: res.data?.system_reporting.report_unit || "",
              report_formula: res.data?.system_reporting.report_formula || "",
              neutrality_formula:
                res.data?.system_reporting.neutrality_formula || "",
            });
          } else {
            setReportData({
              report_name: "",
              report_unit: "",
              report_formula: "",
              neutrality_formula: "",
            });
          }
        } else {
          Error(res.message || "Failed to load system data");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to load system data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, systemId, plantId, organizationId, departmentId]);

  useEffect(() => {
    if (type === "update" && systemId) {
      getSystemData();
    } else if (type === "add") {
      setSystemData({
        system_name: "",
        system_info: "",
        status: "",
        plant_id: plantId || 0,
        organization_id: organizationId || 0,
        department_id: departmentId || 0,
      });
      setReportData({
        report_name: "",
        report_unit: "",
        report_formula: "",
        neutrality_formula: "",
      });
    }
  }, [type, systemId, plantId, organizationId, departmentId]);

  const handleAddSystem = async () => {
    setErrors({ system_name: "", system_info: "", status: "" });

    if (!systemData.system_name.trim()) {
      setErrors((prev) => ({
        ...prev,
        system_name: "System name is required",
      }));
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (type === "add") {
        await dispatch(
          createSystem({
            system_name: systemData.system_name,
            system_description: systemData?.system_info,
            status: systemData.status || "active",
            plant_id: plantId || 0,
            organization_id: organizationId || 0,
            department_id: departmentId || 0,
            system_reporting: reportData,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message);
              setShowAddSystemPopup(false);
              onUpdateSuccess();
            } else {
              Error(res.message || "Failed to create system");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to create system");
          });
      } else {
        await dispatch(
          updateSystem({
            system_id: systemId || 0,
            system_name: systemData.system_name,
            system_description: systemData?.system_info,
            status: systemData.status || "active",
            plant_id: systemData.plant_id || plantId || 0,
            department_id: systemData.department_id || departmentId || 0,
            organization_id: systemData.organization_id || organizationId || 0,
            system_reporting: reportData,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message);
              setShowAddSystemPopup(false);
              onUpdateSuccess();
            } else {
              Error(res.message || "Failed to update system");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to update system");
          });
      }
    } catch (error) {
      console.error("Error with system operation:", error);
      Error(
        error instanceof ApiError
          ? error.message
          : "Failed to perform system operation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-100">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-normal text-text-primary font-roboto">
            {type === "add" ? "Add New System" : "Update System"}
          </h2>
          <button
            onClick={() => setShowAddSystemPopup(false)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              System Name
            </label>
            <input
              type="text"
              name="system_name"
              placeholder="Enter system name"
              value={systemData.system_name}
              onChange={(e) =>
                setSystemData((prev) => ({
                  ...prev,
                  system_name: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.system_name
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.system_name && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.system_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              System Info
            </label>
            <textarea
              name="system_info"
              placeholder="Enter system info"
              value={systemData?.system_info}
              onChange={(e) =>
                setSystemData((prev) => ({
                  ...prev,
                  system_info: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.system_info
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.system_info && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.system_info}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Status
            </label>
            <select
              name="status"
              value={systemData?.status}
              onChange={(e) =>
                setSystemData((prev) => ({ ...prev, status: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.status ? "border-status-danger" : "border-border-primary"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.status}
              </p>
            )}
          </div>

          <div>
            <label className="block text-lg font-normal text-text-primary mb-2 font-roboto">
              System Reporting
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                Report Name
              </label>
              <input
                type="text"
                name="report_name"
                value={reportData.report_name}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    report_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                placeholder="Enter report name"
              />
            </div>
            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                Report Unit
              </label>
              <select
                name="report_unit"
                value={reportData.report_unit}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    report_unit: e.target.value,
                  }))
                }
                className="w-full px-3 py-2.5 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
              >
                <option value="Ltr">Ltr</option>
                <option value="M^3">m³</option>
              </select>
            </div>
          </div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Formula
          </label>
          {/* <textarea
            name="report_formula"
            value={reportData.report_formula}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                report_formula: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
            placeholder="Enter report formula"
          /> */}
          <Editor
            height="80%"
            width="100%"
            value={reportData.report_formula}
            onChange={(value) =>
              setReportData((prev) => ({
                ...prev,
                report_formula: value ? value : "",
              }))
            }
            language="javascript"
            className="w-full h-[125px] px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          />
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Neutrality Formula
          </label>
          {/* <textarea
            name="report_neutrality_formula"
            value={reportData.neutrality_formula}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                neutrality_formula: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
            placeholder="Enter report neutrality formula"
          /> */}
          <Editor
            height="80%"
            width="100%"
            value={reportData.neutrality_formula}
            onChange={(value) =>
              setReportData((prev) => ({
                ...prev,
                neutrality_formula: value ? value : "",
              }))
            }
            language="javascript"
            className="w-full h-[125px] px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddSystemPopup(false)}
              className="px-4 py-1.5 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSystem}
              disabled={isLoading}
              className={`px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {type === "add" ? "Add System" : "Update System"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateSystem;
