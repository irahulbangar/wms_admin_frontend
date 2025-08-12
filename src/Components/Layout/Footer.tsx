interface FooterProps {

  sidebarCollapsed: boolean;
}

const Footer: React.FC<FooterProps> = ({ sidebarCollapsed }) => {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-border-primary flex items-center ${sidebarCollapsed ? 'left-20' : 'left-72'}`}>
      <div className="flex-1 h-full flex items-center px-6 relative">
        <div className="text-text-secondary text-sm font-medium">
          2024© Bulfro Monitech Pvt.Ltd
        </div>
      </div>
    </footer>
  )
}

export default Footer
