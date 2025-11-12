import React from "react";
import { X, Trash2 } from "lucide-react";
import type { AdminUsers } from "../../model/admin-users.interface";

interface DeleteAdminPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adminUser: AdminUsers | null;
  isLoading?: boolean;
}

const DeleteAdminPopup: React.FC<DeleteAdminPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  adminUser,
  isLoading = false,
}) => {
  if (!isOpen || !adminUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-primary rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-normal text-text-primary font-roboto">
              Delete Admin User
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-text-primary/80 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-secondary mb-4 font-roboto">
            Are you sure you want to delete this admin user?
          </p>

          <div className="bg-secondary rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary font-roboto">Name :</span>
                <span className="text-text-primary font-roboto font-normal capitalize">
                  {adminUser.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-roboto">Email :</span>
                <span className="text-text-primary font-roboto font-normal">
                  {adminUser.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-roboto">Role :</span>
                <span className="text-text-primary font-roboto font-normal capitalize">
                  {adminUser.role === "admin" ? "Admin" : "Super Admin"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-text-secondary text-sm font-roboto">
            This action cannot be undone. The admin will be permanently removed
            from the system.
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

export default DeleteAdminPopup;
