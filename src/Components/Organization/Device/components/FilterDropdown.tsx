import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

interface FilterDropdownProps<T = any> {
  placeholder: string;
  allLabel: string;
  selectedValue: string;
  options: T[];
  onSelect: (value: string) => void;
  onClear?: () => void;
  getDisplayValue: (option: T) => string;
  getOptionId: (option: T) => string;
  searchPlaceholder: string;
  className?: string;
  filterFn?: (option: T) => boolean;
}

const FilterDropdown = <T extends Record<string, any>>({
  placeholder,
  allLabel,
  selectedValue,
  options,
  onSelect,
  onClear,
  getDisplayValue,
  getOptionId,
  searchPlaceholder,
  className = "",
  filterFn,
}: FilterDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) => {
    const matchesSearch = getDisplayValue(option)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return filterFn ? filterFn(option) && matchesSearch : matchesSearch;
  });

  const displayValue =
    selectedValue === "all"
      ? allLabel
      : options.find((opt) => getOptionId(opt) === selectedValue)
      ? getDisplayValue(
          options.find((opt) => getOptionId(opt) === selectedValue)!
        )
      : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      handleSelect("all");
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div
      className={`flex-shrink-0 md:w-54 w-full relative ${className}`}
      ref={dropdownRef}
    >
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          readOnly
          className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
            onClick={handleClear}
          >
            {allLabel}
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={getOptionId(option)}
                className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                onClick={() => handleSelect(getOptionId(option))}
              >
                {getDisplayValue(option)}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-text-secondary text-sm">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
