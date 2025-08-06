import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    user: { email: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing auth state on component mount
    useEffect(() => {
        const savedAuth = localStorage.getItem('wms-auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                setIsAuthenticated(authData.isAuthenticated);
                setUser(authData.user);
            } catch (error) {
                console.error('Error parsing saved auth data:', error);
                localStorage.removeItem('wms-auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        if (email && password) {
            const userData = { email };
            setIsAuthenticated(true);
            setUser(userData);
            
            // Save to localStorage
            localStorage.setItem('wms-auth', JSON.stringify({
                isAuthenticated: true,
                user: userData
            }));
            
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        
        // Remove from localStorage
        localStorage.removeItem('wms-auth');
    };

    const value = {
        isAuthenticated,
        login,
        logout,
        user,
    };

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 