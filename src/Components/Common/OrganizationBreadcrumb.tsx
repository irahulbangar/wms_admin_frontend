import { Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  displayValue?: string;
}

interface OrganizationBreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onHomeClick?: () => void;
}

/**
 * Unified breadcrumb component for Organization pages
 * Supports flexible breadcrumb paths with custom labels and actions
 */
const OrganizationBreadcrumb: React.FC<OrganizationBreadcrumbProps> = ({
  items,
  showHome = true,
  onHomeClick,
}) => {
  const handleBackToHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      const homeItem = items.find((item) => item.label === "Home");
      if (homeItem) {
        homeItem.onClick();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
      {showHome && (
        <>
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          {items.length > 0 && <ChevronRight className="w-4 h-4 text-text-muted" />}
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.isActive ? (
            <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
              {item.displayValue || item.label}
            </span>
          ) : (
            <>
              <button
                onClick={item.onClick}
                className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
              >
                <span>{item.label}</span>
              </button>
              {index < items.length - 1 && (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrganizationBreadcrumb;
