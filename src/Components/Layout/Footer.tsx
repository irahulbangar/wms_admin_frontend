
const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center">
      {/* Dark sidebar */}
      <div className="w-72 h-full"></div>
      
      {/* Main content area */}
      <div className="flex-1 h-full flex items-center px-6 relative">
        {/* Copyright text positioned at bottom left */}
        <div className="text-gray-600 text-sm font-medium">
          2024© Bulfro Monitech Pvt.Ltd
        </div>
      </div>
    </footer>
  )
}

export default Footer
