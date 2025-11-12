import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../store/store";
import {
  addOrganization,
  getOrganizationById,
  updateOrganization,
} from "../../../store/organizationSlice";
import { Error, Success } from "../../utils/toast";
import { ApiError } from "../../utils/errorHandler";

interface AddUpdateOrganizationProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  organizationId: string;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
  refreshOrganizations?: () => void;
}

const AddUpdateOrganization: React.FC<AddUpdateOrganizationProps> = ({
  setShowAddModal,
  type,
  organizationId,
  refreshOrganizations,
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    notes: "",
    status: "",
    introduction: "",
    governance: "",
    logo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // const validateForm = (): boolean => {
  //   const newErrors: Record<string, string> = {};

  //   if (!formData.name.trim()) {
  //     newErrors.name = "Organization name is required";
  //   } else if (formData.name.trim().length < 2) {
  //     newErrors.name = "Organization name must be at least 2 characters";
  //   }

  //   if (!formData.address.trim()) {
  //     newErrors.address = "Address is required";
  //   } else if (formData.address.trim().length < 3) {
  //     newErrors.address = "Address must be at least 3 characters";
  //   }

  //   if (!formData.contactPerson.trim()) {
  //     newErrors.contactPerson = "Contact person is required";
  //   } else if (!/^[a-zA-Z\s]+$/.test(formData.contactPerson.toString())) {
  //     newErrors.contactPerson = "Contact person must be a valid name";
  //   }

  //   if (!formData.contactNumber.trim()) {
  //     newErrors.contactNumber = "Contact number is required";
  //   } else if (
  //     !/^[0-9]{10}$/.test(formData.contactNumber.toString().trim()) ||
  //     formData.contactNumber.toString().trim().length !== 10
  //   ) {
  //     newErrors.contactNumber = "Please enter exactly 10 digits";
  //   }

  //   if (!formData.email.trim()) {
  //     newErrors.email = "Email is required";
  //   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
  //     newErrors.email = "Please enter a valid email address";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        logo: "",
      }));
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validImageTypes.includes(file.type)) {
      Error("Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Error("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        logo: base64String,
      }));

      if (errors.logo) {
        setErrors((prev) => ({
          ...prev,
          logo: "",
        }));
      }
    };

    reader.onerror = () => {
      Error("Failed to read the file");
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   return;
    // }
    setIsLoading(true);
    try {
      const organizationData = {
        organization_name: formData.name,
        address: formData.address,
        contact_person: formData.contactPerson,
        contact_number: formData.contactNumber,
        email: formData.email,
        note: formData.notes,
        status: formData.status || "active",
        introduction: formData.introduction,
        governance: formData.governance,
        logo: formData.logo,
      };

      if (type === "add") {
        await dispatch(addOrganization(organizationData))
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message || "Organization added successfully");
              setShowAddModal(false);
              setFormData({
                name: "",
                address: "",
                contactPerson: "",
                contactNumber: "",
                email: "",
                notes: "",
                status: "active",
                introduction: "",
                governance: "",
                logo: "",
              });
              setErrors({});
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              if (refreshOrganizations) {
                refreshOrganizations();
              }
            } else {
              Error(res.message || "Failed to add organization");
            }
          })
          .catch((err) => {
            Error(err.message || "Failed to add organization");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        await dispatch(
          updateOrganization({ id: organizationId, ...organizationData })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              Success(res.message || "Organization updated successfully");
              setShowAddModal(false);
              if (refreshOrganizations) {
                refreshOrganizations();
              }
            } else {
              Error(res.message || "Failed to update organization");
            }
          })
          .catch((err) => {
            Error(err.message || "Failed to update organization");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      Error(
        error instanceof ApiError
          ? error.message
          : "Failed to submit organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type === "update" && organizationId) {
      dispatch(getOrganizationById(organizationId))
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            setFormData({
              name: res.data.organization_name,
              address: res.data.address,
              contactPerson: res.data.contact_person,
              contactNumber: res.data.contact_number,
              email: res.data.email,
              notes: res.data.note,
              status: res.data.status || "active",
              introduction: res.data.introduction || "",
              governance: res.data.governance || "",
              logo: res.data.logo || "",
            });
          } else {
            Error(res.message || "Failed to get organization");
          }
        })
        .catch((err) => {
          Error(
            err instanceof ApiError ? err.message : "Failed to get organization"
          );
        });
    } else if (type === "add") {
      setFormData({
        name: "",
        address: "",
        contactPerson: "",
        contactNumber: "",
        email: "",
        notes: "",
        status: "active",
        introduction: "",
        governance: "",
        logo: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [type, organizationId, dispatch]);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between sticky top-0 bg-primary px-6 py-4 border-b border-border-primary z-10">
          <h2 className="text-xl font-normal text-text-primary font-roboto">
            {type === "add" ? "Add New Organization" : "Update Organization"}
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-text-primary hover:text-text-secondary cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Organization Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.name ? "border-status-danger" : "border-border-primary"
            }`}
            placeholder="Enter organization name"
          />
          {errors.name && (
            <p className="text-status-danger text-sm mt-1">{errors.name}</p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Contact Person
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.contactPerson
                ? "border-status-danger"
                : "border-border-primary"
            }`}
            placeholder="Enter contact person"
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Contact Number
          </label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            maxLength={10}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.contactNumber
                ? "border-status-danger"
                : "border-border-primary"
            }`}
            placeholder="Enter 10 digit contact number"
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.email ? "border-status-danger" : "border-border-primary"
            }`}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-status-danger text-sm mt-1">{errors.email}</p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.address ? "border-status-danger" : "border-border-primary"
            }`}
            placeholder="Enter organization address"
          />
          {errors.address && (
            <p className="text-status-danger text-sm mt-1">{errors.address}</p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Introduction
          </label>
          <textarea
            name="introduction"
            value={formData.introduction}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.introduction
                ? "border-status-danger"
                : "border-border-primary"
            }`}
            placeholder="Enter organization introduction"
          />
          {errors.introduction && (
            <p className="text-status-danger text-sm mt-1">
              {errors.introduction}
            </p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Governance
          </label>
          <textarea
            name="governance"
            value={formData.governance}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
            placeholder="Enter organization governance"
          />
          {errors.governance && (
            <p className="text-status-danger text-sm mt-1">
              {errors.governance}
            </p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Logo
          </label>
          <input
            type="file"
            name="logo"
            ref={fileInputRef}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.logo ? "border-status-danger" : "border-border-primary"
            }`}
          />
          {formData.logo && (
            <div className="mt-2">
              <p className="text-sm text-text-secondary font-roboto">
                Image selected and converted to base64
              </p>
              <img
                src={formData.logo}
                alt="Logo preview"
                className="mt-2 max-w-full h-32 object-contain rounded-md border border-border-primary"
              />
            </div>
          )}
          {errors.logo && (
            <p className="text-status-danger text-sm mt-1">{errors.logo}</p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border rounded-md focus:outline-none focus:ring-1 focus:ring-status-info ${
              errors.status ? "border-status-danger" : "border-border-primary"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && (
            <p className="text-status-danger text-sm mt-1">{errors.status}</p>
          )}

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
            placeholder="Enter notes"
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors cursor-pointer font-roboto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-roboto"
              disabled={isLoading}
            >
              {isLoading
                ? "Adding..."
                : type === "add"
                ? "Add Organization"
                : "Update Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateOrganization;
