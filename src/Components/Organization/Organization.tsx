import React, { useState } from "react";
import { Search, PlusCircle, Building2, X } from "lucide-react";
import NoDataFound from "../NoDataFound";

interface AddOrganizationForm {
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  notes: string;
}

const Organization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddOrganizationForm>({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-center w-full sticky top-0 bg-primary">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Organizations
          </h1>
          <p className="text-text-secondary">
            Manage your organization's information and settings
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-primary rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg hover:bg-secondary transition-all duration-200">
            <Filter className="w-4 h-4" />
            Filter
          </button> */}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 scrollbar-hide">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-primary pb-4 shadow-sm border-b border-border-primary">
              <h2 className="text-xl font-semibold text-text-primary">
                Add New Organization
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-primary hover:text-text-secondary cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NoDataFound
        icon={<Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />}
        title="No organizations found"
        description="Add your first organization to get started"
        buttonText="Add Organization"
        buttonOnClick={() => setShowAddModal(true)}
      />
    </div>
  );
};

export default Organization;
