import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder,
  onChange,
  onClear,
  className = "flex-shrink-0 relative md:w-60 lg:w-80 w-full",
}) => {
  return (
    <div className={className}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="md:w-60 lg:w-80 w-full pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
