import React, { useState, useMemo } from "react";
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Building2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import NoDataFound from "../NoDataFound";

// Mock data for organizations
const mockOrganizations = [
  {
    id: 1,
    name: "TechCorp Solutions",
    address: "123 Innovation Drive, Tech City, TC 12345",
    contactPerson: "John Doe",
    contactNumber: "+1 (555) 123-4567",
    email: "contact@techcorp.com",
    notes: "Leading technology solutions provider",
  },
  {
    id: 2,
    name: "Global Manufacturing Inc",
    address: "456 Industrial Blvd, Manufacturing District, MD 67890",
    contactPerson: "Jane Smith",
    contactNumber: "+1 (555) 987-6543",
    email: "info@globalmanufacturing.com",
    notes: "International manufacturing and logistics",
  },
  {
    id: 3,
    name: "Green Energy Co",
    address: "789 Renewable Way, Eco Park, EP 11111",
    contactPerson: "Mike Johnson",
    contactNumber: "+1 (555) 456-7890",
    email: "hello@greenenergy.com",
    notes: "Sustainable energy solutions and consulting",
  },
  {
    id: 4,
    name: "Digital Innovations Ltd",
    address: "321 Digital Street, Innovation Hub, IH 22222",
    contactPerson: "Sarah Brown",
    contactNumber: "+1 (555) 789-0123",
    email: "contact@digitalinnovations.com",
    notes: "Cutting-edge digital transformation services",
  },
];

interface Organization {
  id: number;
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  notes: string;
}

interface AddOrganizationForm {
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  notes: string;
}

const Organization = () => {
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddOrganizationForm>({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    notes: "",
  });

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrganization: Organization = {
        id: Date.now(),
        ...formData,
      };

      setOrganizations((prev) => [newOrganization, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: "",
        address: "",
        contactPerson: "",
        contactNumber: "",
        email: "",
        notes: "",
      });
      toast.success("Organization added successfully!");
    } catch {
      toast.error("Failed to add organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setOrganizations((prev) => prev.filter((org) => org.id !== id));
    toast.success("Organization deleted successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center w-full">
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
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      {filteredOrganizations.length > 0 ? (
        <div className="bg-secondary rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-text-secondary overflow-auto resposive">
            <thead className="text-xs text-text-secondary uppercase bg-secondary border-b border-border-secondary">
              <tr>
                <th scope="col" className="px-4 py-3 text-center">
                  Sr No
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Organization Name
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Address
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Contact Person
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Contact Number
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Notes
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="border-b border-border-secondary">
                  <td className="px-4 py-3">{org.id}</td>
                  <td
                    scope="row"
                    className="px-4 py-3 font-medium text-text-primary whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-status-info rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      {org.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    {org.address}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    {org.contactPerson}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    {org.contactNumber}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    {org.email}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    {org.notes}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-1 text-text-primary hover:text-status-info transition-colors cursor-pointer"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-text-primary hover:text-status-success transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="p-1 text-text-primary hover:text-status-danger transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-text-secondary">
              Showing
              <span className="font-semibold text-text-primary mx-1">1-10</span>
              of
              <span className="font-semibold text-text-primary ml-1">1000</span>
            </span>
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-text-primary bg-primary rounded-l-lg border border-border-primary hover:bg-primary hover:text-text-primary"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-text-primary bg-primary border border-border-primary hover:bg-primary hover:text-text-primary"
                >
                  1
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-text-primary bg-primary border border-border-primary hover:bg-primary hover:text-text-primary"
                >
                  2
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-text-primary bg-primary border border-border-primary hover:bg-primary hover:text-text-primary"
                >
                  100
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-text-primary bg-primary border border-border-primary hover:bg-primary hover:text-text-primary"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        <NoDataFound
          icon={
            <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
          }
          title="No organizations found"
          description="Add your first organization to get started"
          buttonText="Add Organization"
          buttonOnClick={() => setShowAddModal(true)}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Organization Name *
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
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
