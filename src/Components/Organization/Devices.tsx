import { Search, PlusCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const Devices = () => {
  const { organization_id, project_id } = useParams<{
    organization_id: string;
    project_id: string;
  }>();

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-5">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary font-roboto">
            Devices
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <select
              value={organization_id}
              onChange={() => {}}
              className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
            >
              <option value="all">All Organization</option>
              <option value="1">Organization 1</option>
              <option value="2">Organization 2</option>
              <option value="3">Organization 3</option>
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={project_id}
              onChange={() => {}}
              className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
            >
              <option value="all">All Project</option>
              <option value="1">Project 1</option>
              <option value="2">Project 2</option>
              <option value="3">Project 3</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success font-roboto"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto">
          <PlusCircle className="w-4 h-4" />
          Add Device
        </button>
      </div>

      <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
        <table className="w-full text-base text-left rtl:text-right text-text-primary">
          <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
            <tr>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Sr No
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Name
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Type
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Status
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Location
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Created At
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Updated At
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-primary bg-primary hover:bg-secondary">
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                1
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Name
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Type
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Status
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Location
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Created At
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Device Updated At
              </td>
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                Action
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;
