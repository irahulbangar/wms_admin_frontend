import React, { useState, useEffect } from "react";
import type { DiagramNode } from "./utils/diagramCalculations";

interface DepartmentPopupProps {
  show: boolean;
  selectedDepartment: string | null;
  nodes: DiagramNode[];
  departmentDimensions: Record<string, { width: number; height: number }>;
  onClose: () => void;
  onDimensionsChange: (width: number, height: number) => void;
}

const DepartmentPopup: React.FC<DepartmentPopupProps> = ({
  show,
  selectedDepartment,
  nodes,
  departmentDimensions,
  onClose,
  onDimensionsChange,
}) => {
  const currentDimensions = departmentDimensions[selectedDepartment || ""] || {
    width: 625,
    height: 350,
  };

  const [widthInput, setWidthInput] = useState(
    currentDimensions.width.toString()
  );
  const [heightInput, setHeightInput] = useState(
    currentDimensions.height.toString()
  );

  useEffect(() => {
    setWidthInput(currentDimensions.width.toString());
    setHeightInput(currentDimensions.height.toString());
  }, [currentDimensions.width, currentDimensions.height]);

  const updateDimensions = (newWidth?: number, newHeight?: number) => {
    const width = newWidth !== undefined ? newWidth : currentDimensions.width;
    const height =
      newHeight !== undefined ? newHeight : currentDimensions.height;
    onDimensionsChange(width, height);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setWidthInput(inputValue);

    if (inputValue === "") return;

    const value = parseInt(inputValue);
    if (isNaN(value) || value < 300 || value > 8000) return;

    updateDimensions(value);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHeightInput(inputValue);

    if (inputValue === "") return;

    const value = parseInt(inputValue);
    if (isNaN(value) || value < 200 || value > 3000) return;

    updateDimensions(undefined, value);
  };

  if (!show || !selectedDepartment) return null;

  const handleResetToDefault = () => {
    updateDimensions(625, 350);
    setWidthInput("625");
    setHeightInput("350");
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary border border-border-primary rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-normal text-text-primary">
            Edit Department Dimensions
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-normal text-text-primary font-roboto">
              Department Name:{" "}
              {nodes.find((n) => n.id === selectedDepartment)?.data.label}
            </label>
            <div className="text-xs text-text-secondary mb-2 font-roboto">
              Current size: {currentDimensions.width}px ×{" "}
              {currentDimensions.height}px
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs text-blue-800 font-roboto">
              <strong>💡 Tip:</strong> The department group (highlighted in
              blue) will resize immediately as you change the values below.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
                Width (px)
              </label>
              <input
                type="number"
                min="300"
                max="8000"
                step="1"
                value={widthInput}
                onChange={handleWidthChange}
                placeholder="Enter width"
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-status-info"
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
                Height (px)
              </label>
              <input
                type="number"
                min="200"
                max="3000"
                step="1"
                value={heightInput}
                onChange={handleHeightChange}
                placeholder="Enter height"
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-primary text-text-primary focus:outline-none focus:ring-1 focus:ring-status-info"
              />
            </div>
          </div>

          <div className="text-xs text-text-secondary font-roboto">
            <p>• Minimum width: 300px, Maximum width: 8000px</p>
            <p>• Minimum height: 200px, Maximum height: 3000px</p>
            <p>• Changes will reposition devices automatically</p>
            <p className="text-status-info font-roboto font-normal">
              • Group will resize immediately as you type
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary border border-border-primary rounded-md text-text-primary hover:bg-primary/80 font-roboto cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-status-warning hover:bg-status-warning/80 text-white rounded-md transition-colors font-roboto cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPopup;
