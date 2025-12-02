import { ChevronDown, Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface FilterOption {
  id: string | number;
  name: string;
}

interface FilterDropdownProps {
  placeholder: string;
  allLabel: string;
  value: string;
  options: FilterOption[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  className?: string;
  dropdownClassName?: string;
  // Optional: external state management (if not provided, component manages its own)
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * Unified filter dropdown component
 * Can work with external state management (Systems/Departments) or internal state (Devices)
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  placeholder,
  allLabel,
  value,
  options,
  onSelect,
  onSelectAll,
  className = "flex-shrink-0 md:w-54 w-full relative",
  dropdownClassName = "",
  // External state management (optional)
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const searchTerm =
    externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const handleToggle = () => {
    if (externalOnToggle) {
      externalOnToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleSearchChange = (value: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (externalOnToggle) {
          externalOnToggle();
          if (externalOnSearchChange) {
            externalOnSearchChange("");
          }
        } else {
          setInternalIsOpen(false);
          setInternalSearchTerm("");
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, externalOnToggle, externalOnSearchChange]);

  const displayValue =
    value === "all"
      ? allLabel
      : options.find((opt) => opt.id.toString() === value)?.name || placeholder;

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          readOnly
          className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
          onClick={handleToggle}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto ${dropdownClassName}`}
        >
          <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
            onClick={() => {
              onSelectAll();
              handleToggle();
              handleSearchChange("");
            }}
          >
            {allLabel}
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                onClick={() => {
                  onSelect(option.id.toString());
                  handleToggle();
                  handleSearchChange(option.name);
                }}
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-text-secondary text-sm">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
