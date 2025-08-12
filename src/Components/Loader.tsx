const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

        <div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-r-green-500 border-b-purple-500 border-l-orange-500 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>

        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
