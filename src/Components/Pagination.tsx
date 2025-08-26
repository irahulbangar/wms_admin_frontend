import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  selectedItems?: number;
  showItemsPerPage?: boolean;
  showSelectionInfo?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  selectedItems = 0,
  showItemsPerPage = true,
  showSelectionInfo = true,
  className = "",
}) => {
  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = Number(event.target.value);
    onItemsPerPageChange(newItemsPerPage);
  };

  if (totalPages <= 1 && !showItemsPerPage && !showSelectionInfo) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between px-6 pt-4 bg-primary border-t border-border-primary absolute bottom-0 w-full ${className}`}
    >
      {/* Left side - Selection info */}
      {showSelectionInfo && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary font-roboto">
            {selectedItems} of {totalItems} row(s) selected
          </span>
        </div>
      )}

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-4">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary font-roboto">
              Rows per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-3 py-1.5 border border-border-secondary rounded bg-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {/* Page info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary font-roboto">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed rounded transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>

          {/* Previous page button */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed rounded transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5 -ml-3" />
          </button>

          {/* Next page button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed rounded transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5 -ml-3" />
          </button>

          {/* Last page button */}
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed rounded transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-5 h-5 -ml-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
