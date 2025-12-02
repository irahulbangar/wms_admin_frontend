import { ChevronDown, Search } from "lucide-react";
import { useRef, useEffect } from "react";

interface FilterOption {
  id: string | number;
  name: string;
}

interface FilterDropdownProps {
  placeholder: string;
  allLabel: string;
  value: string;
  options: FilterOption[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  dropdownClassName?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  placeholder,
  allLabel,
  value,
  options,
  searchTerm,
  onSearchChange,
  onSelect,
  onSelectAll,
  isOpen,
  onToggle,
  className = "flex-shrink-0 md:w-54 w-full relative",
  dropdownClassName = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle();
        onSearchChange("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onToggle, onSearchChange]);

  const displayValue =
    value === "all"
      ? allLabel
      : options.find((opt) => opt.id.toString() === value)?.name || placeholder;

  return (
    <div className={className} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          readOnly
          className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
          onClick={onToggle}
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
            onClick={() => {
              onSelectAll();
              onToggle();
              onSearchChange("");
            }}
          >
            {allLabel}
          </div>

          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                onClick={() => {
                  onSelect(option.id.toString());
                  onToggle();
                  onSearchChange(option.name);
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
