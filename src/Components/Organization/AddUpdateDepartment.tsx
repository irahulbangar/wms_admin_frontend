import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store/store";
import {
  createDepartment,
  getDepartmentById,
  updateDepartment,
} from "../../../store/departmentSlice";
import { Error, Success } from "../../utils/toast";

interface UpdateDepartmentProps {
  setShowAddDepartmentPopup: (show: boolean) => void;
  type: "add" | "update";
  projectId?: number;
  departmentId?: number;
  onUpdateSuccess: () => void;
}

const UpdateDepartment: React.FC<UpdateDepartmentProps> = ({
  setShowAddDepartmentPopup,
  type,
  projectId,
  departmentId,
  onUpdateSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [errors, setErrors] = useState({ department_name: "" });
  const [departmentData, setDepartmentData] = useState({
    department_name: "",
  });

  const getDepartmentData = async () => {
    await dispatch(getDepartmentById(departmentId || 0))
      .unwrap()
      .then((res) => {
        setDepartmentData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (type === "update" && departmentId) {
      getDepartmentData();
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

    try {
      if (type === "add") {
        await dispatch(
          createDepartment({
            department_name: newDepartmentName,
            department_info: "",
            project_id: projectId || 0,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddDepartmentPopup(false);
              setNewDepartmentName("");
              onUpdateSuccess();
            } else {
              Error(res.message);
            }
          });
      } else {
        await dispatch(
          updateDepartment({
            department_name: newDepartmentName,
            department_info: "",
            project_id: projectId || 0,
            department_id: departmentId || 0,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddDepartmentPopup(false);
              setNewDepartmentName("");
              onUpdateSuccess();
            }
          })
          .catch((err) => {
            Error(err.message);
          });
      }
    } catch (error) {
      console.error("Error creating department:", error);
      Error("Failed to create department");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-100">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
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
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Department Name
            </label>
            <input
              type="text"
              name="department_name"
              placeholder="Enter department name"
              value={newDepartmentName || departmentData?.department_name}
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

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDepartmentPopup(false)}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer"
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
