import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../store/store";
import {
  addAdminUser,
  getAdminById,
  updateAdminProfile,
} from "../../store/adminSlice";
import { X, Save, Loader2 } from "lucide-react";
import { Success, Error } from "../utils/toast";

interface AddUpdateAdminProps {
  isOpen: boolean;
  onClose: () => void;
  adminId?: string | null;
  onSuccess: () => void;
  type: string;
}

interface FormData {
  name: string;
  email: string;
  contact_number: string;
  location: string;
  department: string;
  role: string;
  password: string;
}

const AddUpdateAdmin: React.FC<AddUpdateAdminProps> = ({
  isOpen,
  onClose,
  adminId,
  onSuccess,
  type,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    contact_number: "",
    location: "",
    department: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    if (adminId && isOpen) {
      setIsLoading(true);
      dispatch(getAdminById(adminId))
        .unwrap()
        .then((response) => {
          if (response.success && response.admin) {
            const adminData = response.admin;
            setFormData({
              name: adminData.name || "",
              email: adminData.email || "",
              contact_number: adminData.contact_number || "",
              location: adminData.location || "",
              department: adminData.department || "",
              role: adminData.role || "",
              password: "",
            });
          } else {
            console.error("Invalid response structure:", response);
            Error("Invalid admin data received");
          }
        })
        .catch((error) => {
          console.error("Error fetching admin:", error);
          Error("Failed to load admin data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      resetForm();
    }
  }, [adminId, isOpen, dispatch]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact_number: "",
      location: "",
      department: "",
      role: "",
      password: "",
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      Error("Email is required");
      return false;
    }
    if (!formData.contact_number.trim()) {
      Error("Phone number is required");
      return false;
    }
    if (!formData.location.trim()) {
      Error("Location is required");
      return false;
    }
    if (!formData.department.trim()) {
      Error("Department is required");
      return false;
    }
    if (!formData.role.trim()) {
      Error("Role is required");
      return false;
    }
    if (type === "add") {
      if (!formData.password.trim()) {
        Error("Password is required");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (type === "update" && adminId) {
        const updateData = {
          id: adminId,
          name: formData.name,
          email: formData.email,
          contact_number: formData.contact_number,
          location: formData.location,
          department: formData.department,
          role: formData.role,
          status: "active",
        };

        const result = await dispatch(updateAdminProfile(updateData)).unwrap();

        if (result.success) {
          Success("Admin updated successfully!");
          onSuccess();
          onClose();
        } else {
          Error(result.message || "Failed to update admin");
        }
      } else {
        const createData = {
          id: "",
          name: formData.name,
          email: formData.email,
          contact_number: formData.contact_number,
          location: formData.location,
          department: formData.department,
          role: formData.role,
          password: formData.password,
          status: "active",
        };

        const result = await dispatch(addAdminUser(createData)).unwrap();

        if (result.success) {
          Success("Admin created successfully!");
          onSuccess();
          onClose();
        } else {
          Error(result.message || "Failed to create admin");
        }
      }
    } catch (error) {
      console.error("Admin operation error:", error);
      Error("Operation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border-primary rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "update" ? "Update Admin" : "Add Admin"}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && type === "update" ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-text-secondary">
              Loading admin data...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) =>
                  handleInputChange("contact_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                placeholder="Enter phone number"
              />
            </div>

            {type === "add" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto"
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-roboto cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer transition-colors flex items-center font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {type === "update" ? "Update Admin" : "Add Admin"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddUpdateAdmin;
