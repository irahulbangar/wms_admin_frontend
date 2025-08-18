import React from "react";

interface NoDataFoundProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonOnClick: () => void;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonOnClick,
}) => {
  return (
    <div className="text-center py-12">
      {icon}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-4">{description}</p>
      <button
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={buttonOnClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default NoDataFound;
