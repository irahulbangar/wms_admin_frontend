import { X } from "lucide-react";
import React from "react";

interface AddDeviceFamilyProps {
  type: "add" | "update";
}

const AddDeviceFamily: React.FC<AddDeviceFamilyProps> = ({ type }) => {
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-100">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "add" ? "Add New Device Family" : "Update Device Family"}
          </h2>
          <button className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Device Family Name
            </label>
            <input
              type="text"
              name="device_family_name"
              placeholder="Enter device family name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer"
            >
              {type === "add" ? "Add Device Family" : "Update Device Family"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceFamily;
