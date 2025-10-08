import React from "react";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  onNavigate,
  className = ""
}) => {
  const handleBreadcrumbClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit ${className}`}>
      <nav
        className="flex items-center space-x-2 text-sm font-roboto"
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-text-muted"
                aria-hidden="true"
              />
            )}
            <div
              className={`flex items-center space-x-2 transition-colors cursor-pointer px-2 py-1 rounded ${
                item.isActive || index === items.length - 1
                  ? "text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-overlay/20"
              }`}
              onClick={() => handleBreadcrumbClick(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBreadcrumbClick(item.path);
                }
              }}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumb;
