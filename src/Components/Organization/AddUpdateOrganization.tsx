import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../store/store";
import {
  addOrganization,
  getOrganizationById,
  updateOrganization,
} from "../../../store/organizationSlice";
import { Error, Success } from "../../utils/toast";

interface AddUpdateOrganizationProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  organizationId: string;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
}

const AddUpdateOrganization: React.FC<AddUpdateOrganizationProps> = ({
  setShowAddModal,
  type,
  organizationId,
  onUpdateSuccess,
}) => {
  const dispatch = useAppDispatch();
  const hasCalledAPI = useRef(false);
  const hasFetchedOrganization = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    notes: "",
    status: "active",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const organizationData = {
      org_name: formData.name,
      address: formData.address,
      contact_person: formData.contactPerson,
      contact_number: formData.contactNumber,
      email: formData.email,
      note: formData.notes,
      status: formData.status,
    };

    if (type === "add") {
      dispatch(addOrganization(organizationData))
        .unwrap()
        .then((res: { success: boolean }) => {
          if (res.success) {
            Success("Organization added successfully");
            setShowAddModal(false);
          }
        })
        .catch((err: string) => {
          Error(err);
        })
        .finally(() => {
          if (!onUpdateSuccess) {
            setShowAddModal(false);
          }
        });
    } else {
      dispatch(updateOrganization({ id: organizationId, ...organizationData }))
        .unwrap()
        .then((res: { success: boolean; data?: Record<string, unknown> }) => {
          if (res.success) {
            Success("Organization updated successfully");
            if (onUpdateSuccess) {
              onUpdateSuccess(res);
            } else {
              setShowAddModal(false);
            }
          }
        })
        .catch((err: string) => {
          Error(err);
        })
        .finally(() => {
          if (!onUpdateSuccess) {
            setShowAddModal(false);
          }
        });
    }
  };

  useEffect(() => {
    if (
      type === "update" &&
      organizationId &&
      !hasFetchedOrganization.current
    ) {
      hasFetchedOrganization.current = true;
      dispatch(getOrganizationById(organizationId))
        .unwrap()
        .then((res) => {
          setFormData({
            name: res.data.org_name,
            address: res.data.address,
            contactPerson: res.data.contact_person,
            contactNumber: res.data.contact_number,
            email: res.data.email,
            notes: res.data.note,
            status: res.data.status || "active",
          });
        })
        .catch((err) => {
          Error(err as string);
        });
    } else if (type === "add") {
      hasFetchedOrganization.current = false;
      setFormData({
        name: "",
        address: "",
        contactPerson: "",
        contactNumber: "",
        email: "",
        notes: "",
        status: "active",
      });
    }
    return () => {
      hasFetchedOrganization.current = false;
    };
  }, [type, organizationId, dispatch]);

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 scrollbar-hide">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-primary pb-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary">
            {type === "add" ? "Add New Organization" : "Update Organization"}
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-text-primary hover:text-text-secondary cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact person"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {type === "add" ? "Add Organization" : "Update Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateOrganization;
