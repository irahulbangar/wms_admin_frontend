import { X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "../../../../store/store";
import {
  createDepartment,
  getDepartmentById,
  updateDepartment,
} from "../../../../store/departmentSlice";
import { Error, Success } from "../../../utils/toast";
import { ApiError } from "../../../utils/errorHandler";
import type { DepartmentResult } from "../../../../model/department.interface";

interface UpdateDepartmentProps {
  setShowAddDepartmentPopup: (show: boolean) => void;
  type: "add" | "update";
  plantId?: number;
  departmentId?: number;
  onUpdateSuccess: () => void;
  organizationId?: number;
}

interface DepartmentReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
}

const UpdateDepartment: React.FC<UpdateDepartmentProps> = ({
  setShowAddDepartmentPopup,
  type,
  plantId,
  departmentId,
  onUpdateSuccess,
  organizationId,
}) => {
  const dispatch = useAppDispatch();
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [errors, setErrors] = useState({
    department_name: "",
    department_info: "",
  });
  const [departmentData, setDepartmentData] = useState({
    department_name: "",
    department_info: "",
    plant_id: plantId || 0,
    organization_id: organizationId || 0,
  });
  const [reportData, setReportData] = useState<DepartmentReporting>({
    report_name: "",
    report_unit: "",
    report_formula: "",
    neutrality_formula: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const getDepartmentData = useCallback(async () => {
    if (!departmentId) return;

    setIsLoading(true);
    try {
      const res = await dispatch(getDepartmentById(departmentId)).unwrap();

      if (res.success || res.status === 200) {
        let department: DepartmentResult | null = null;

        if (Array.isArray(res.data)) {
          if (res.data.length > 0) {
            department = res.data[0] as DepartmentResult;
          }
        } else if (res.data && typeof res.data === "object") {
          department = res.data as DepartmentResult;
        }

        if (department) {
          setDepartmentData({
            department_name: department.department_name || "",
            department_info: department.department_info || "",
            plant_id: department.plant_id || plantId || 0,
            organization_id: department.organization_id || organizationId || 0,
          });

          setNewDepartmentName(department.department_name || "");

          if (department.department_reporting) {
            setReportData({
              report_name: department.department_reporting.report_name || "",
              report_unit: department.department_reporting.report_unit || "",
              report_formula:
                department.department_reporting.report_formula || "",
              neutrality_formula:
                department.department_reporting.neutrality_formula || "",
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
          console.error("Department data not found in response:", res);
          Error("Department data not found");
        }
      } else {
        Error(res.message || "Failed to get department data");
      }
    } catch (err: any) {
      console.error("Error fetching department:", err);
      Error(err?.message || "Failed to get department data");
    } finally {
      setIsLoading(false);
    }
  }, [departmentId, dispatch, plantId, organizationId]);

  useEffect(() => {
    if (type === "update" && departmentId) {
      getDepartmentData();
    } else if (type === "add") {
      setNewDepartmentName("");
      setDepartmentData({
        department_name: "",
        department_info: "",
        plant_id: plantId || 0,
        organization_id: organizationId || 0,
      });
      setReportData({
        report_name: "",
        report_unit: "",
        report_formula: "",
        neutrality_formula: "",
      });
    }
  }, [type, departmentId]);

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) {
      setErrors((prev) => ({
        ...prev,
        department_name: "Department name is required",
      }));
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (type === "add") {
        await dispatch(
          createDepartment({
            department_name: newDepartmentName,
            department_info: departmentData?.department_info,
            plant_id: plantId || 0,
            organization_id: organizationId || 0,
            department_reporting: reportData,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message || "Department created successfully");
              setShowAddDepartmentPopup(false);
              setNewDepartmentName("");
              onUpdateSuccess();
            } else {
              Error(res.message || "Failed to create department");
            }
          })
          .catch((err) => {
            Error(err.message || "Failed to create department");
          });
      } else {
        await dispatch(
          updateDepartment({
            department_name: newDepartmentName,
            department_info: departmentData?.department_info,
            plant_id: plantId || 0,
            department_id: departmentId || 0,
            organization_id: organizationId || 0,
            department_reporting: reportData,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message || "Department updated successfully");
              setShowAddDepartmentPopup(false);
              setNewDepartmentName("");
              onUpdateSuccess();
            } else {
              Error(res.message || "Failed to update department");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to update department");
          });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      Error(
        error instanceof ApiError
          ? error.message
          : "Failed to create department"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-100">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-normal text-text-primary font-roboto">
            {type === "add" ? "Add New Department" : "Update Department"}
          </h2>
          <button
            onClick={() => setShowAddDepartmentPopup(false)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Department Name
            </label>
            <input
              type="text"
              name="department_name"
              placeholder="Enter department name"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.department_name
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.department_name && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.department_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Department Info
            </label>
            <textarea
              name="department_info"
              placeholder="Enter department info"
              value={departmentData?.department_info}
              onChange={(e) =>
                setDepartmentData((prev) => ({
                  ...prev,
                  department_info: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.department_info
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.department_info && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.department_info}
              </p>
            )}
          </div>

          <div>
            <label className="block text-lg font-normal text-text-primary mb-2 font-roboto">
              Department Reporting
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
                <option value="M^3">
                  m<sup>3</sup>
                </option>
              </select>
            </div>
          </div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Formula
          </label>
          <input
            type="text"
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
          />
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Neutrality Formula
          </label>
          <input
            type="text"
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
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDepartmentPopup(false)}
              className="px-4 py-1.5 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDepartment}
              disabled={isLoading}
              className={`px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {type === "add" ? "Add Department" : "Update Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDepartment;
