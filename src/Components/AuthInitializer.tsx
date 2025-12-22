import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { checkAuthStatus, logout } from "../../store/adminSlice";
import { jwtDecode } from "jwt-decode";

interface AuthInitializerProps {
  children: React.ReactNode;
}

interface CustomJwtPayload {
  exp?: number;
  email?: string;
  name?: string;
  role?: string;
  contact_number?: string;
  status?: string;
  created_at?: string;
  location?: string;
  department?: string;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.admin);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        dispatch(checkAuthStatus());
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const tokenValidationInterval = setInterval(() => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            dispatch(logout());
            if (window.location.pathname !== "/login") {
              navigate("/login", { replace: true });
            }
          } else {
            dispatch(checkAuthStatus());
          }
        } catch (error) {
          console.error("Error validating token:", error);
          dispatch(logout());
          if (window.location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }
      } else {
        dispatch(checkAuthStatus());
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(tokenValidationInterval);
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (
      isInitialized &&
      !isAuthenticated &&
      window.location.pathname !== "/login"
    ) {
      navigate("/login", { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
