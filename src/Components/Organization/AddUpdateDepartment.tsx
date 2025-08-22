import { X } from "lucide-react";
import React from "react";

interface AddUpdateDepartmentProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  onUpdateSuccess: () => void;
}

const AddUpdateDepartment: React.FC<AddUpdateDepartmentProps> = ({
  setShowAddModal,
  type,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "update" ? "Update Department" : "Add New Department"}
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form className="p-6 space-y-4">
          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
            Department Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success font-roboto"
            placeholder="Enter department name"
          />

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
            Department Info
          </label>
          <textarea
            className="w-full px-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success font-roboto"
            placeholder="Enter department info"
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-text-primary hover:text-text-primary/80 border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-roboto cursor-pointer"
            >
              {type === "update" ? "Update Department" : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateDepartment;
