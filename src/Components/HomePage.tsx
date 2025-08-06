import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import { useState } from 'react';
import Dashboard from './Dashboard/Dashboard';

const HomePage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
            <div className="flex h-screen overflow-hidden">
                <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage={currentPage} onPageChange={setCurrentPage} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-transparent">
                        <div className="p-6 space-y-6">
                            {currentPage === 'home' && <Dashboard />}
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default HomePage; 