import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "/background.jpg";
import { Error, Success } from "../utils/toast";
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginAdmin } from "../../store/adminSlice";
import Loader from "./Loader";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated || isLoading) {
    return <Loader />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.clear();

    try {
      await dispatch(loginAdmin({ email, password }))
        .unwrap()
        .then((res) => {
          if (res.success) {
            navigate("/home");
            Success(res.message);
          } else {
            Error(res.message);
          }
        });
    } catch (error) {
      console.error("Login error:", error);
      Error(
        typeof error === "string" ? error : "An error occurred during login."
      );
    }
  };

  const getEmailBorderClass = () => {
    if (isEmailFocused && !email) {
      return "border-status-danger focus:border-status-danger focus:ring-status-danger/20";
    } else if (email) {
      return "border-status-success focus:border-status-success focus:ring-status-success/20";
    }
    return "border-border-primary focus:border-border-primary focus:ring-border-primary/20";
  };

  const getPasswordBorderClass = () => {
    if (isPasswordFocused && !password) {
      return "border-status-danger focus:border-status-danger focus:ring-status-danger/20";
    } else if (password) {
      return "border-status-success focus:border-status-success focus:ring-status-success/20";
    }
    return "border-border-primary focus:border-border-primary focus:ring-border-primary/20";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-pan-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50 bg-opacity-40"></div>
      <div className="max-w-md w-full relative z-10 bg-primary rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col mb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-1 font-roboto">
              Welcome Back
            </h2>
            <p className="text-text-secondary font-roboto">
              Sign in to your WMS Dashboard
            </p>
          </div>
          <button
            className="p-2.5 rounded-xl text-text-primary bg-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer absolute top-4 right-4"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-2 font-roboto"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className={`w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 transition-colors font-roboto ${getEmailBorderClass()}`}
            placeholder="Enter your email"
            inputMode="email"
          />

          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-2 font-roboto"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className={`w-full px-3 py-2 pr-10 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 transition-colors font-roboto ${getPasswordBorderClass()}`}
              placeholder="Enter your password"
              inputMode="text"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-status-info focus:ring-status-info border-border-primary rounded cursor-pointer font-roboto"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-text-secondary font-roboto"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-status-info hover:text-status-info/80 font-roboto"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 font-roboto">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
