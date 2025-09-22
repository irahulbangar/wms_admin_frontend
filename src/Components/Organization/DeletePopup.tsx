import React from "react";
import { X, Trash2 } from "lucide-react";
import type { OrganizationResult } from "../../../model/organizations.interface";
import type { DeviceResult } from "../../../model/devices.interface";

interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  organization: OrganizationResult | DeviceResult | null;
  title: string | null;
}

const DeletePopup: React.FC<DeletePopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  organization,
  title,
}) => {
  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-primary rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-text-primary font-roboto">
              Delete {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-text-primary/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-secondary mb-4 font-roboto">
            Are you sure you want to delete this {title}?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-primary bg-primary border border-border-primary rounded-lg hover:bg-primary/80 transition-colors cursor-pointer font-roboto"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-lg transition-colors flex items-center gap-2 font-roboto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
