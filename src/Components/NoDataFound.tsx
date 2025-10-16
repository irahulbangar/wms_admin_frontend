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
    <div className="text-center py-12 bg-primary rounded-lg h-full flex flex-col items-center justify-center">
      {icon}
      <h3 className="text-lg font-medium text-text-primary mb-2 font-roboto">
        {title}
      </h3>
      <p className="text-text-secondary mb-4 font-roboto">{description}</p>
      <button
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        onClick={buttonOnClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default NoDataFound;
