import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store/store";
import { Error, Success } from "../../utils/toast";
import { createSystem, updateSystem } from "../../../store/systemSlice";


interface AddUpdateSystemProps {
  setShowAddSystemPopup: (show: boolean) => void;
  type: "add" | "update";
  plantId?: number;
  systemId?: number;
  onUpdateSuccess: () => void;
  organizationId?: number;
  departmentId?: number;
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
  const [newSystemName, setNewSystemName] = useState("");
  const [errors, setErrors] = useState({ system_name: "", system_info: "" });
  const [systemData, setSystemData] = useState({
    system_name: "",
    system_info: "",
    plant_id: plantId || 0,
    organization_id: organizationId || 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getSystemData = async () => {
    setIsLoading(true);
    await dispatch(getSystemById(systemId || 0))
      .unwrap()
      .then((res) => {
        setSystemData(res.data);
        setNewSystemName(res.data.system_name);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (type === "update" && systemId) {
      getSystemData();
    } else if (type === "add") {
      setNewSystemName("");
      setSystemData({
        system_name: "",
        system_info: "",
        plant_id: plantId || 0,
        organization_id: organizationId || 0,
      });
    }
  }, [type, systemId, plantId, organizationId]);

  const handleAddSystem = async () => {
    if (!newSystemName.trim()) {
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
            system_name: newSystemName,
            system_info: systemData?.system_info,
            plant_id: plantId || 0,
            organization_id: organizationId || 0,
            department_id: departmentId || 0,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddSystemPopup(false);
              setNewSystemName("");
              onUpdateSuccess();
            } else {
              Error(res.message);
            }
          });
      } else {
        await dispatch(
          updateSystem({
            system_id: systemId || 0,
            system_name: newSystemName,
            system_info: systemData?.system_info,
            plant_id: plantId || 0,
            department_id: departmentId || 0,
            organization_id: organizationId || 0,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddSystemPopup(false);
              setNewSystemName("");
              onUpdateSuccess();
            } else {
              Error(res.message);
            }
          })
          .catch((err) => {
            console.log(err);
            Error("Failed to update system");
          });
      }
    } catch (error) {
      console.error("Error creating system:", error);
      Error("Failed to create department");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-100">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
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
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              System Name
            </label>
            <input
              type="text"
              name="system_name"
              placeholder="Enter system name"
              value={newSystemName}
              onChange={(e) => setNewSystemName(e.target.value)}
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
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              System Info
            </label>
            <textarea
              name="system_info"
              placeholder="Enter system info"
              value={systemData?.system_info}
              onChange={(e) => setSystemData((prev) => ({ ...prev, system_info: e.target.value }))}
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

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddSystemPopup(false)}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSystem}
              disabled={isLoading}
              className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer ${
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
