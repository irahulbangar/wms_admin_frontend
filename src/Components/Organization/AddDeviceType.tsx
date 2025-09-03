import { X, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useAppDispatch } from "../../../store/store";
import { createDeviceType } from "../../../store/deviceTypeSlice";
import { Error, Success } from "../../utils/toast";

interface AddDeviceTypeProps {
  setShowAddDeviceTypePopup: (show: boolean) => void;
  type: "add" | "update";
  deviceFamilyId: number;
  onUpdateSuccess: () => void;
}

const AddDeviceType: React.FC<AddDeviceTypeProps> = ({
  setShowAddDeviceTypePopup,
  type,
  deviceFamilyId,
  onUpdateSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_type_name: "",
    topic: "",
  });
  const [errors, setErrors] = useState({ device_type_name: "", topic: "" });
  console.log("deviceFamilyId", deviceFamilyId);

  const handleAddDeviceType = async () => {
    if (!formData.device_type_name.trim()) {
      setErrors((prev) => ({
        ...prev,
        device_type_name: "Device type name is required",
      }));
      return;
    }

    if (!formData.topic.trim()) {
      setErrors((prev) => ({
        ...prev,
        topic: "Topic is required",
      }));
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(
        createDeviceType({
          device_family_id: deviceFamilyId,
          device_type_name: formData.device_type_name,
          topic: formData.topic,
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            Success(res.message);
            setShowAddDeviceTypePopup(false);
            setFormData({ device_type_name: "", topic: "" });
            onUpdateSuccess();
          } else {
            Error(res.message);
          }
        });
    } catch (error) {
      console.error("Error creating device type:", error);
      Error("Failed to create device type");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "add" ? "Add New Device Type" : "Update Device Type"}
          </h2>
          <button
            onClick={() => setShowAddDeviceTypePopup(false)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Device Type Name
            </label>
            <input
              type="text"
              name="device_type_name"
              value={formData.device_type_name}
              onChange={handleInputChange}
              placeholder="Enter device type name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.device_type_name
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.device_type_name && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.device_type_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="Enter topic"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.topic ? "border-status-danger" : "border-border-primary"
              }`}
            />
            {errors.topic && (
              <p className="text-status-danger text-sm mt-1 font-roboto">
                {errors.topic}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDeviceTypePopup(false)}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDeviceType}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-roboto cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {type === "add" ? "Add Device Type" : "Update Device Type"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeviceType;
