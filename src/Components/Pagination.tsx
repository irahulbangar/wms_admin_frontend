import React, { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  disabled?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  rowsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onRowsPerPageChange,
  disabled = false,
  className = "",
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const hasNoData = totalItems === 0;

  const getCurrentPageItemCount = () => {
    if (hasNoData) return 0;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    return endIndex - startIndex;
  };

  const currentPageItemCount = useMemo(() => {
    return getCurrentPageItemCount();
  }, [currentPage, rowsPerPage, totalItems]);

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (disabled) return;
    const newRowsPerPage = parseInt(event.target.value);
    onRowsPerPageChange(newRowsPerPage);
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-primary border-t border-border-primary absolute bottom-0 left-0 right-0 ${className}`}
    >
      <div className="flex items-center text-sm text-text-secondary">
        <span className="font-roboto">
          {currentPageItemCount} of {totalItems} row(s) selected.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary font-roboto">
            Rows per page
          </span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            disabled={disabled || hasNoData}
            className="p-2 text-sm bg-primary border border-border-primary rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-status-info disabled:opacity-50 disabled:cursor-not-allowed font-roboto"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-text-secondary font-roboto">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={disabled || isFirstPage || hasNoData}
            className="p-1 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4 text-text-secondary" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || isFirstPage || hasNoData}
            className="p-1 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || isLastPage || hasNoData}
            className="p-1 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || isLastPage || hasNoData}
            className="p-1 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
