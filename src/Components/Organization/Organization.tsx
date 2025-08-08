import React, { useState } from "react";
import { Search, PlusCircle, Monitor, Filter } from "lucide-react";
import { toast } from "react-toastify";

// Mock data for organizations
const mockOrganizations = [
  {
    id: 1,
    name: "TechCorp Solutions",
    description: "Leading technology solutions provider",
    address: "123 Innovation Drive, Tech City, TC 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@techcorp.com",
    employeeCount: 150,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Global Manufacturing Inc",
    description: "International manufacturing and logistics",
    address: "456 Industrial Blvd, Manufacturing District, MD 67890",
    phone: "+1 (555) 987-6543",
    email: "info@globalmanufacturing.com",
    employeeCount: 320,
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Green Energy Co",
    description: "Sustainable energy solutions and consulting",
    address: "789 Renewable Way, Eco Park, EP 11111",
    phone: "+1 (555) 456-7890",
    email: "hello@greenenergy.com",
    employeeCount: 85,
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Digital Innovations Ltd",
    description: "Cutting-edge digital transformation services",
    address: "321 Digital Street, Innovation Hub, IH 22222",
    phone: "+1 (555) 789-0123",
    email: "contact@digitalinnovations.com",
    employeeCount: 200,
    status: "active",
    createdAt: "2024-01-30",
  },
];

interface Organization {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  employeeCount: number;
  status: string;
  createdAt: string;
}

interface AddOrganizationForm {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  expiryDate: string;
  userName: string;
}

const Organization = () => {
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddOrganizationForm>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    expiryDate: "",
    userName: "",
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrganization: Organization = {
        id: Date.now(),
        ...formData,
        employeeCount: 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setOrganizations((prev) => [newOrganization, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        expiryDate: "",
        userName: "",
      });
      toast.success("Organization added successfully!");
    } catch {
      toast.error("Failed to add organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Organizations
          </h1>
          <p className="text-text-secondary">
            Manage your organization information and settings
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-primary rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg hover:bg-secondary transition-all duration-200">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      <div className="text-center py-12">
        <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No devices found
        </h3>
        <p className="text-text-muted mb-4">
          Add your first organization to get started
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          Add Organization
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add New Organization
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter expiry date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter user name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Adding..." : "Add Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;
