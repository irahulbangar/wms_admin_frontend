import { useEffect, useState } from "react";
import { Search, PlusCircle, Building2, Trash2, SquarePen } from "lucide-react";
import NoDataFound from "../NoDataFound";
import { useAppDispatch } from "../../../store/store";
import { getOrganizations } from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/get-organizations.interface";
import AddUpdateOrganization from "./AddUpdateOrganization";

const Organization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const dispatch = useAppDispatch();
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([]);

  useEffect(() => {
    dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganizations(res.data);
        }
      });
  }, []);

  const handleEditOrganization = (id: string) => {
    console.log(id);
    setShowAddModal(true);
  };

  const handleDeleteOrganization = (id: string) => {
    console.log(id);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-5">
      <div className="flex items-center w-full sticky top-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Organizations
          </h1>
          <p className="text-text-secondary">
            Manage your organization's information and settings
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
        <AddUpdateOrganization setShowAddModal={setShowAddModal} />
      )}

      <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
        <table className="w-full text-sm text-left rtl:text-right text-text-primary">
          <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
            <tr>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Sr No
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Organization Name
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Address
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Contact Person
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Contact Number
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Email
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Notes
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.length > 0 ? (
              organizations.map((organization, index) => (
                <tr
                  key={organization.organization_id}
                  className="bg-primary border-b border-border-primary hover:bg-secondary"
                >
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.org_name}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.address}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.contact_person}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.contact_number}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.email}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {organization.note}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    <div className="flex items-center gap-3 justify-center">
                      <SquarePen
                        onClick={() =>
                          handleEditOrganization(organization.organization_id)
                        }
                        className="w-5 h-5 text-status-info cursor-pointer"
                      />
                      <Trash2
                        onClick={() =>
                          handleDeleteOrganization(organization.organization_id)
                        }
                        className="w-5 h-5 text-status-danger cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-text-primary text-center font-roboto text-sm"
                >
                  <NoDataFound
                    icon={
                      <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    }
                    title="No organizations found"
                    description="Add your first organization to get started"
                    buttonText="Add Organization"
                    buttonOnClick={() => setShowAddModal(true)}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Organization;
