import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import Profile from './Profile';
import Devices from './Organization/Devices';
import Users from './Organization/Users';
import AdminUsers from './Users';
import AdminSetting from './AdminSetting';
import Setting from './Organization/Setting';

const HomePage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const location = useLocation();
    const navigate = useNavigate();

    // Update current page based on URL
    useEffect(() => {
        if (location.pathname === '/organization/devices') {
            setCurrentPage('devices');
        } else if (location.pathname === '/organization/users') {
            setCurrentPage('users');
        } else if (location.pathname === '/organization/setting') {
            setCurrentPage('organization-setting');
        } else if (location.pathname === '/home') {
            setCurrentPage('dashboard');
        } else if (location.pathname === '/profile') {
            setCurrentPage('profile');
        } else if (location.pathname === '/admin-users') {
            setCurrentPage('admin-users');
        } else if (location.pathname === '/admin-setting') {
            setCurrentPage('admin-setting');
        }
    }, [location.pathname]);

    const handlePageChange = (page: string) => {
        setCurrentPage(page);
        
        // Navigate to appropriate route
        switch (page) {
            case 'devices':
                navigate('/organization/devices');
                break;
            case 'users':
                navigate('/organization/users');
                break;
            case 'organization-setting':
                navigate('/organization/setting');
                break;
            case 'dashboard':
                navigate('/home');
                break;
            case 'profile':
                navigate('/profile');
                break;
            case 'admin-users':
                navigate('/admin-users');
                break;
            case 'admin-setting':
                navigate('/admin-setting');
                break;
            default:
                navigate('/home');
        }
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'devices':
                return <Devices />;
            case 'users':
                return <Users />;
            case 'organization-setting':
                return <Setting />;
            case 'profile':
                return <Profile />;
            case 'admin-users':
                return <AdminUsers />;
            case 'admin-setting':
                return <AdminSetting />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen dashboard-bg transition-all duration-500">
            <div className="flex h-screen overflow-hidden">
                <Sidebar 
                    collapsed={sidebarCollapsed} 
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                    currentPage={currentPage} 
                    onPageChange={handlePageChange} 
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header 
                        sidebarCollapsed={sidebarCollapsed} 
                        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-theme-primary pb-16">
                        <div className="p-6 space-y-6">
                            {renderContent()}
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default HomePage; 