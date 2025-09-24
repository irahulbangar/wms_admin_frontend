import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../store/store";
import {
  addAdminUser,
  getAdminById,
  updateAdminProfile,
} from "../../store/adminSlice";
import { X, Save } from "lucide-react";
import { Success, Error } from "../utils/toast";
import type { CreateAdminPayload } from "../../store/adminSlice";

interface AddUpdateAdminProps {
  isOpen: boolean;
  onClose: () => void;
  adminId?: string | null;
  onSuccess: () => void;
  type: string;
}

const AddUpdateAdmin: React.FC<AddUpdateAdminProps> = ({
  isOpen,
  onClose,
  adminId,
  onSuccess,
  type,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<CreateAdminPayload>({
    name: "",
    email: "",
    contact_number: "",
    location: "",
    department: "",
    role: "",
    password: "",
    status: "active",
  });

  useEffect(() => {
    if (adminId && isOpen) {
      dispatch(getAdminById(adminId))
        .unwrap()
        .then((res) => {
          if (res.success) {
            const adminData = res.data;
            setFormData({
              name: adminData.name || "",
              email: adminData.email || "",
              contact_number: adminData.contact_number || "",
              location: adminData.location || "",
              department: adminData.department || "",
              role: adminData.role || "",
              password: "",
              status: adminData.status || "active",
            });
          } else {
            console.error("Invalid response structure:", res.message);
            Error("Invalid admin data received");
          }
        })
        .catch((error) => {
          console.error("Error fetching admin:", error.message);
          Error("Failed to load admin data");
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
      status: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: CreateAdminPayload) => ({
      ...prev,
      [name]: value,
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
    if (!/^\d{10}$/.test(formData.contact_number.trim())) {
      Error("Phone number must be exactly 10 digits");
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
          status: formData.status,
          password: formData.password || "",
        };

        dispatch(updateAdminProfile(updateData))
          .unwrap()
          .then((result) => {
            if (result.success) {
              Success(result.message || "Admin updated successfully!");
              onSuccess();
              onClose();
            } else {
              Error(result.message || "Failed to update admin");
            }
          });
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          contact_number: formData.contact_number,
          location: formData.location,
          department: formData.department,
          role: formData.role,
          password: formData.password,
          status: "active",
        };

        dispatch(addAdminUser(createData))
          .unwrap()
          .then((result) => {
            if (result.success) {
              Success(result.message || "Admin created successfully!");
              onSuccess();
              onClose();
            } else {
              Error(result.message || "Failed to create admin");
            }
          });
      }
    } catch (error) {
      console.error("Admin operation error:", error);
      Error("Operation failed. Please try again.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border-primary rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto h-full">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Phone Number
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Address
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
              placeholder="Enter department"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info transition-colors font-roboto"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-roboto cursor-pointer bg-primary border border-border-primary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer transition-colors flex items-center font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {type === "update" ? "Update Admin" : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateAdmin;
