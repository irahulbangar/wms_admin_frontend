import React, { useEffect } from "react";
import { X, Package } from "lucide-react";
import type {
  PlantCalculations,
  DepartmentCalculations,
  SystemCalculations,
} from "./utils/diagramCalculations";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: {
    id: string;
    name: string;
    type: "plant" | "department" | "system";
  } | null;
  calculations:
    | PlantCalculations
    | DepartmentCalculations
    | SystemCalculations
    | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  selectedGroup,
  calculations,
}) => {
  if (!isOpen || !selectedGroup) {
    return null;
  }

  if (!calculations) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-80 sm:w-96 bg-primary shadow-2xl border-l border-border-primary z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary bg-primary">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedGroup.type === "plant"
                    ? "bg-blue-500"
                    : selectedGroup.type === "department"
                    ? "bg-green-500"
                    : "bg-purple-500"
                }`}
              ></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedGroup.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-border-primary rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading calculations...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }


  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);



  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 sm:w-96 bg-primary shadow-2xl border-l border-border-primary z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary bg-primary">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                selectedGroup.type === "plant"
                  ? "bg-blue-500"
                  : selectedGroup.type === "department"
                  ? "bg-green-500"
                  : "bg-purple-500"
              }`}
            ></div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {selectedGroup.name}
              </h2>
              <p className="text-xs text-text-secondary capitalize">
                {selectedGroup.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-border-primary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Summary Table */}
          <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
            <div className="bg-secondary/20 px-4 py-2 border-b border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary">
                Flow Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border-primary">
                  <tr className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-text-secondary font-medium">
                      Total In
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-text-primary">
                        {calculations.totalIn} Ltr
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-text-secondary font-medium">
                      Total Out
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-text-primary">
                        {calculations.totalOut} Ltr
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-text-secondary font-medium">
                      Balance
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-text-primary">
                        {calculations.totalBalance} Ltr
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage Information (if available) */}
          {"totalStock" in calculations && "totalCapacity" in calculations && (
            <div className="space-y-4">
              <div className="bg-primary border border-border-primary rounded-lg overflow-hidden">
                <div className="bg-secondary/20 px-4 py-2 border-b border-border-primary">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Storage Information</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border-primary">
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary font-medium">
                          Current Stock
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-text-primary">
                            {calculations.totalStock} Ltr
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary font-medium">
                          Available Stock
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-text-primary">
                            {calculations.totalCapacity -
                              calculations.totalStock}{" "}
                            Ltr
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-secondary/10">
                        <td className="px-4 py-3 text-text-secondary font-medium">
                          Total Capacity
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-text-primary">
                            {calculations.totalCapacity} Ltr
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
