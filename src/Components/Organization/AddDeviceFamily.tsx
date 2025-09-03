import { X, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useAppDispatch } from "../../../store/store";
import {
  createDeviceFamily,
  updateDeviceFamily,
} from "../../../store/deviceFamilySlice";
import { Error, Success } from "../../utils/toast";

interface AddDeviceFamilyProps {
  setShowAddDeviceFamilyPopup: (show: boolean) => void;
  type: "add" | "update";
  deviceFamilyId?: number;
  deviceFamilyName?: string;
  onUpdateSuccess: () => void;
}

const AddDeviceFamily: React.FC<AddDeviceFamilyProps> = ({
  setShowAddDeviceFamilyPopup,
  type,
  deviceFamilyId,
  deviceFamilyName: initialDeviceFamilyName,
  onUpdateSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [deviceFamilyName, setDeviceFamilyName] = useState(
    initialDeviceFamilyName || ""
  );
  const [errors, setErrors] = useState({ name: "" });
  const handleAddDeviceFamily = async () => {
    if (!deviceFamilyName.trim()) {
      setErrors((prev) => ({
        ...prev,
        name: "Device family name is required",
      }));
      return;
    }

    try {
      setIsLoading(true);

      if (type === "add") {
        await dispatch(
          createDeviceFamily({
            name: deviceFamilyName,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddDeviceFamilyPopup(false);
              setDeviceFamilyName("");
              onUpdateSuccess();
            } else {
              Error(res.message);
            }
          });
      } else if (type === "update" && deviceFamilyId) {
        await dispatch(
          updateDeviceFamily({
            device_family_id: deviceFamilyId,
            name: deviceFamilyName,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setShowAddDeviceFamilyPopup(false);
              setDeviceFamilyName("");
              onUpdateSuccess();
            } else {
              Error(res.message);
            }
          });
      }
    } catch (error) {
      console.error("Error creating/updating device family:", error);
      Error(`Failed to ${type} device family`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "add" ? "Add New Device Family" : "Update Device Family"}
          </h2>
          <button
            onClick={() => setShowAddDeviceFamilyPopup(false)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Device Family Name
            </label>
            <input
              type="text"
              value={deviceFamilyName}
              onChange={(e) => {
                setDeviceFamilyName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              placeholder="Enter device family name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.name ? "border-status-danger" : "border-border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDeviceFamilyPopup(false)}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDeviceFamily}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-roboto cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {type === "add" ? "Add Device Family" : "Update Device Family"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeviceFamily;
