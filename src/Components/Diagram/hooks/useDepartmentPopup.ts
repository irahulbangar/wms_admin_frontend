import { useState, useEffect, useCallback } from "react";
import type { DiagramNode } from "../utils/diagramCalculations";

export const useDepartmentPopup = (
  setNodes: (
    nodes: DiagramNode[] | ((nodes: DiagramNode[]) => DiagramNode[])
  ) => void,
  setHasChanges: (hasChanges: boolean) => void,
  setDepartmentDimensions: (
    dimensions:
      | Record<string, { width: number; height: number }>
      | ((
          dimensions: Record<string, { width: number; height: number }>
        ) => Record<string, { width: number; height: number }>)
  ) => void
) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);

  // Create global function for opening department popup
  useEffect(() => {
    (window as any).openDepartmentPopup = (nodeId: string) => {
      setSelectedDepartment(nodeId);
      setShowDepartmentPopup(true);
    };

    return () => {
      delete (window as any).openDepartmentPopup;
    };
  }, []);

  // Handle group edit click events
  useEffect(() => {
    const handleGroupEditClick = (event: any) => {
      const { nodeId } = event.detail;
      setSelectedDepartment(nodeId);
      setShowDepartmentPopup(true);
    };

    document.addEventListener("groupEditClick", handleGroupEditClick);

    return () => {
      document.removeEventListener("groupEditClick", handleGroupEditClick);
    };
  }, []);

  const handleDepartmentDimensionsChange = useCallback(
    (width: number, height: number) => {
      if (selectedDepartment) {
        setNodes((currentNodes) => {
          const updatedNodes = currentNodes.map((node) => {
            if (node.id === selectedDepartment && node.type === "group") {
              return {
                ...node,
                width: width,
                height: height,
                draggable: true,
                selectable: true,
                deletable: false,
                dragHandle: ".group-drag-handle",
                style: {
                  ...node.style,
                  width: `${width}px`,
                  height: `${height}px`,
                  minWidth: `${width}px`,
                  minHeight: `${height}px`,
                  maxWidth: `${width}px`,
                  maxHeight: `${height}px`,
                  zIndex: 10,
                },
              };
            }
            return node;
          });

          return updatedNodes.map((node) => {
            if (node.parentId === selectedDepartment) {
              const parentNode = updatedNodes.find(
                (n) => n.id === selectedDepartment
              );
              if (parentNode) {
                const parentWidth = width;
                const parentHeight = height;

                if (node.type === "tank") {
                  const tankWidth = 80;
                  const tankHeight = 96;
                  const tankSpacing = 20;
                  const sideMargin = 50;

                  const availableWidth = parentWidth - 2 * sideMargin;
                  const maxTanksPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (tankWidth + tankSpacing))
                  );

                  const tankIndex = parseInt(node.id.split("-tank")[1]) - 1;
                  const totalRows = Math.ceil(
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length / maxTanksPerRow
                  );

                  const row = Math.floor(tankIndex / maxTanksPerRow);
                  const col = tankIndex % maxTanksPerRow;

                  const totalTanksInRow = Math.min(
                    maxTanksPerRow,
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length -
                      row * maxTanksPerRow
                  );
                  const rowWidth =
                    totalTanksInRow * tankWidth +
                    (totalTanksInRow - 1) * tankSpacing;
                  const startX = sideMargin + (availableWidth - rowWidth) / 2;

                  const deviceX = startX + col * (tankWidth + tankSpacing);

                  let deviceY;
                  if (totalRows === 1) {
                    deviceY = (parentHeight - tankHeight) / 2;
                  } else {
                    const availableHeight = parentHeight - 100;
                    const rowSpacing = Math.max(
                      20,
                      (availableHeight - totalRows * tankHeight) /
                        (totalRows + 1)
                    );
                    deviceY = 60 + rowSpacing + row * (tankHeight + rowSpacing);
                  }

                  return {
                    ...node,
                    position: { x: deviceX, y: deviceY },
                  };
                } else if (node.type === "fm") {
                  const fmWidth = 96;
                  const fmHeight = 64;
                  const sideMargin = 50;
                  const fmSpacing = 20;

                  const availableWidth = parentWidth - 2 * sideMargin;
                  const maxTanksPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (80 + 20))
                  );
                  const totalTankRows = Math.ceil(
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length / maxTanksPerRow
                  );
                  const tankAreaHeight =
                    totalTankRows > 0
                      ? totalTankRows * 96 + (totalTankRows - 1) * 20 + 120
                      : 0;

                  const totalFMs = updatedNodes.filter(
                    (n) => n.parentId === selectedDepartment && n.type === "fm"
                  ).length;

                  const maxFMsPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (fmWidth + fmSpacing))
                  );
                  const totalFMRows = Math.ceil(totalFMs / maxFMsPerRow);

                  const fmStartY = tankAreaHeight + 20;
                  const availableHeight = parentHeight - fmStartY - 20;
                  const fmVerticalSpacing =
                    totalFMRows > 1
                      ? Math.min(
                          80,
                          Math.max(
                            60,
                            (availableHeight - totalFMRows * fmHeight) /
                              (totalFMRows - 1)
                          )
                        )
                      : 0;

                  const fmIndex = parseInt(node.id.split("-fm")[1]) - 1;
                  const row = Math.floor(fmIndex / maxFMsPerRow);
                  const col = fmIndex % maxFMsPerRow;

                  const totalFMsInRow = Math.min(
                    maxFMsPerRow,
                    totalFMs - row * maxFMsPerRow
                  );
                  const rowWidth =
                    totalFMsInRow * fmWidth + (totalFMsInRow - 1) * fmSpacing;
                  const startX = sideMargin + (availableWidth - rowWidth) / 2;

                  const deviceX = startX + col * (fmWidth + fmSpacing);
                  const deviceY =
                    fmStartY + row * (fmHeight + fmVerticalSpacing);

                  return {
                    ...node,
                    position: { x: deviceX, y: deviceY },
                  };
                }
              }
            }
            return node;
          });
        });

        setDepartmentDimensions((prevDimensions) => ({
          ...prevDimensions,
          [selectedDepartment]: { width, height },
        }));

        setHasChanges(true);
      }
    },
    [selectedDepartment, setNodes, setHasChanges, setDepartmentDimensions]
  );

  const handleCloseDepartmentPopup = useCallback(() => {
    if (selectedDepartment) {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          if (node.id === selectedDepartment && node.type === "group") {
            return {
              ...node,
              style: {
                ...node.style,
                zIndex: 1,
              },
            };
          }
          return node;
        });
      });
    }

    setShowDepartmentPopup(false);
    setSelectedDepartment(null);
  }, [selectedDepartment, setNodes]);

  return {
    selectedDepartment,
    showDepartmentPopup,
    handleDepartmentDimensionsChange,
    handleCloseDepartmentPopup,
  };
};
