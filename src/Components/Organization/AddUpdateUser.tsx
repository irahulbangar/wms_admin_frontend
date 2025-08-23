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
import type { OrganizationResult } from "../../../model/organizations.interface";

interface AddUpdateUserProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  clientId: number;
  onClose: () => void;
  organizationId: number;
  organizationData: OrganizationResult[];
}

const AddUpdateUser: React.FC<AddUpdateUserProps> = ({
  setShowAddModal,
  type,
  clientId,
  onClose,
  organizationId,
  organizationData,
}) => {
  const [formData, setFormData] = useState<CreateClientPayload>({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_password: "",
    role: "",
    status: "",
    organization_id: organizationId,
  } as CreateClientPayload);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = "Please enter a valid email address";
    }

    if (!formData.client_phone.trim()) {
      newErrors.client_phone = "Client Phone is required";
    } else if (!/^\d{10}$/.test(formData.client_phone)) {
      newErrors.client_phone = "Please enter a valid 10-digit phone number";
    }

    if (type === "add" && !formData.client_password.trim()) {
      newErrors.client_password = "Client Password is required";
    } else if (type === "add" && formData.client_password.length < 6) {
      newErrors.client_password = "Password must be at least 6 characters";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Client Role is required";
    }

    if (!formData.status.trim()) {
      newErrors.status = "Client Status is required";
    }

    setErrors(newErrors as Record<string, string>);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (type === "add") {
        const clientData: CreateClientPayload = {
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          client_password: formData.client_password,
          role: formData.role,
          status: formData.status,
          organization_id: (formData.organization_id as number) || 1,
        };

        dispatch(createClient(clientData))
          .unwrap()
          .then((res) => {
            if (res.success) {
              setShowAddModal(false);
              Success(res.message);
              onClose();
            }
          })
          .catch((err) => {
            Error(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        const clientData: UpdateClientPayload = {
          client_id: clientId,
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          client_password: formData.client_password,
          role: formData.role,
          status: formData.status,
          organization_id: formData.organization_id as number,
        };

        dispatch(updateClient(clientData))
          .unwrap()
          .then((res) => {
            if (res.success) {
              setShowAddModal(false);
              Success(res.message);
              onClose();
            }
          })
          .catch((err) => {
            Error(err.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error: unknown) {
      Error((error as string) || "Something went wrong");
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, organization_id: organizationId }));
  }, [organizationId]);

  useEffect(() => {
    if (type === "update" && clientId > 0) {
      setIsFetching(true);
      dispatch(getClientById(clientId))
        .unwrap()
        .then((res) => {
          if (res.success && res.data) {
            const clientData = Array.isArray(res.data) ? res.data[0] : res.data;
            if (clientData) {
              setFormData({
                client_name: clientData.client_name || "",
                client_email: clientData.client_email || "",
                client_phone: clientData.client_phone || "",
                client_password: "",
                role: clientData.role || "",
                status: clientData.status || "",
                organization_id: clientData.organization_id || organizationId,
              } as CreateClientPayload);
            }
          }
        })
        .catch((err) => {
          Error(err.message);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [type, clientId, dispatch, organizationId]);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "update" ? "Update User" : "Add New User"}
            {isFetching && type === "update" && (
              <span className="ml-2 text-sm text-text-muted">
                Loading user data...
              </span>
            )}
          </h2>
          <button
            onClick={() => onClose()}
            disabled={isLoading || isFetching}
            className={`text-text-muted hover:text-text-primary transition-colors cursor-pointer ${
              isLoading || isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="hidden"
            name="organization_id"
            value={formData.organization_id}
          />

          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Name
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.client_name
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder="Enter Client Name"
              onChange={handleInputChange}
            />
            {errors.client_name && (
              <span className="text-status-danger text-sm">
                {errors.client_name}
              </span>
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Email
            </label>
            <input
              type="email"
              name="client_email"
              value={formData.client_email}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.client_email
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder="Enter Client Email"
              onChange={handleInputChange}
            />
            {errors.client_email && (
              <span className="text-status-danger text-sm">
                {errors.client_email}
              </span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Client Phone
            </label>
            <input
              type="number"
              name="client_phone"
              value={formData.client_phone}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.client_email
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder="Enter Client Phone"
              onChange={handleInputChange}
            />
            {errors.client_phone && (
              <span className="text-status-danger text-sm">
                {errors.client_phone}
              </span>
            )}
          </div>

          {type === "add" && (
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Client Password
              </label>
              <input
                type="password"
                name="client_password"
                value={formData.client_password}
                disabled={isFetching}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.client_password
                    ? "border-status-danger"
                    : "border-border-primary"
                } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="Enter Client Password"
                onChange={handleInputChange}
              />
              {errors.client_password && (
                <span className="text-status-danger text-sm">
                  {errors.client_password}
                </span>
              )}
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Organization
            </label>
            <select
              name="organization_id"
              value={formData.organization_id}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.role ? "border-status-danger" : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              onChange={handleInputChange}
            >
              <option value="">Select Organization</option>
              {organizationData.map((organization) => (
                <option
                  key={organization.organization_id}
                  value={organization.organization_id}
                >
                  {organization.org_name}
                </option>
              ))}
            </select>
            {errors.role && (
              <span className="text-status-danger text-sm">{errors.role}</span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.role ? "border-status-danger" : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              onChange={handleInputChange}
            >
              <option value="">Select Role</option>
              <option value="org_admin">Admin</option>
              <option value="org_user">User</option>
            </select>
            {errors.role && (
              <span className="text-status-danger text-sm">{errors.role}</span>
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              disabled={isFetching}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.status ? "border-status-danger" : "border-border-primary"
              } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
              onChange={handleInputChange}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <span className="text-status-danger text-sm">
                {errors.status}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={isLoading || isFetching}
              className={`px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer ${
                isLoading || isFetching ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
