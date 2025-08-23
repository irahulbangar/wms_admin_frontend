import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  createClient,
  getClientById,
  updateClient,
  type CreateClientPayload,
  type UpdateClientPayload,
} from "../../../store/clientSlice";
import { useAppDispatch } from "../../../store/store";
import { Error, Success } from "../../utils/toast";

interface AddUpdateUserProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  clientId: number;
  onClose: () => void;
}

const AddUpdateUser: React.FC<AddUpdateUserProps> = ({
  setShowAddModal,
  type,
  clientId,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateClientPayload>({
    client_name: "",
    client_email: "",
    client_password: "",
    client_role: "",
    client_status: "",
    organization_id: 0,
  } as CreateClientPayload);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as CreateClientPayload));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev } as Record<string, string>;
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {} as Record<string, string>;
    if (!formData.client_name.trim()) {
      newErrors.client_name = "Client Name is required";
    }
    if (!formData.client_email.trim()) {
      newErrors.client_email = "Client Email is required";
    }
    if (!formData.client_password.trim()) {
      newErrors.client_password = "Client Password is required";
    }
    if (!formData.client_role.trim()) {
      newErrors.client_role = "Client Role is required";
    }
    if (!formData.client_status.trim()) {
      newErrors.client_status = "Client Status is required";
    }
    setErrors(newErrors as Record<string, string>);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const clientData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_password: formData.client_password,
        client_role: formData.client_role,
        client_status: formData.client_status,
        organization_id: formData.organization_id as number,
      };

      if (type === "add") {
        dispatch(createClient(clientData))
          .unwrap()
          .then((res) => {
            if (res.success) {
              setShowAddModal(false);
              Success("Client created successfully");
              onClose();
            }
          })
          .catch((err) => {
            Error(err);
          });
      } else {
        dispatch(updateClient(clientData as UpdateClientPayload))
          .unwrap()
          .then((res) => {
            if (res.success) {
              setShowAddModal(false);
              Success("Client updated successfully");
              onClose();
            }
          })
          .catch((err) => {
            Error(err);
          });
      }
    } catch (error: unknown) {
      Error(error as string);
    }
  };

  useEffect(() => {
    if (type === "update" && clientId > 0) {
      dispatch(getClientById(clientId))
        .unwrap()
        .then((res) => {
          if (res.success) {
            setFormData({
              client_name: res.data.client_name,
              client_email: res.data.client_email,
              client_password: res.data.client_password,
              client_role: res.data.client_role,
              client_status: res.data.client_status,
              organization_id: res.data.organization_id as number,
            } as CreateClientPayload);
            onClose();
          }
        })
        .catch((err) => {
          Error(err);
        });
    }
  }, [type, clientId, dispatch, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "update" ? "Update User" : "Add New User"}
          </h2>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Name
            </label>
            <input
              type="text"
              value={formData.client_name}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                errors.client_name
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
              placeholder="Enter Client Name"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Email
            </label>
            <input
              type="email"
              value={formData.client_email}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                errors.client_email
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
              placeholder="Enter Client Email"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Password
            </label>
            <input
              type="text"
              value={formData.client_password}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                errors.client_password
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
              placeholder="Enter Client Password"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Role
            </label>
            <select
              value={formData.client_role}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                errors.client_role
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            >
              <option value="org_admin">Admin</option>
              <option value="org_user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Status
            </label>
            <select
              value={formData.client_status}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                errors.client_status
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer"
            >
              {type === "update" ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateUser;
