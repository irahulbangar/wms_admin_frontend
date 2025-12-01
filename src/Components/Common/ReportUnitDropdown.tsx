import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface ReportUnitOption {
  value: string;
  label: string;
}

interface ReportUnitDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const reportUnits: ReportUnitOption[] = [
  { value: "Ltr", label: "Ltr" },
  { value: "M^3", label: "m³" },
  { value: "M^3/hr", label: "m³/hr" },
  { value: "LPH", label: "LPH" },
  { value: "KL", label: "KL" },
  { value: "percent", label: "%" },
  { value: "millimeter", label: "mm" },
  { value: "centimeter", label: "cm" },
  { value: "meter", label: "m" },
  { value: "kilometer", label: "km" },
  { value: "inch", label: "in" },
  { value: "foot", label: "ft" },
  { value: "degree Celsius", label: "°C" },
  { value: "degree Fahrenheit", label: "°F" },
  { value: "degree Kelvin", label: "°K" },
  { value: "bar", label: "bar" },
  { value: "psi", label: "psi" },
  { value: "amps", label: "Amps" },
  { value: "volt", label: "Volts" },
  { value: "hertz", label: "Hz" },
  { value: "kw", label: "KW" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "kWh", label: "kWh" },
  { value: "calories", label: "cal" },
  { value: "joules", label: "J" },
  { value: "pascal", label: "Pa" },
  { value: "pint", label: "pt" },
];


const ReportUnitDropdown: React.FC<ReportUnitDropdownProps> = ({
  value,
  onChange,
  label = "Report Unit",
  placeholder = "Select unit",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUnits = reportUnits.filter(
    (unit) =>
      unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUnit = reportUnits.find((unit) => unit.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectUnit = (unitValue: string) => {
    onChange(unitValue);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto flex items-center justify-between"
      >
        <span>{selectedUnit?.label || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-primary border border-border-primary rounded-lg shadow-lg">
          <div className="p-2 border-b border-border-primary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search units..."
                className="w-full pl-10 pr-8 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  onClick={() => handleSelectUnit(unit.value)}
                  className={`w-full px-3 py-2 text-left text-text-primary font-roboto hover:bg-secondary transition-colors ${
                    value === unit.value ? "bg-secondary" : ""
                  }`}
                >
                  {unit.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-text-muted text-center font-roboto">
                No units found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportUnitDropdown;
