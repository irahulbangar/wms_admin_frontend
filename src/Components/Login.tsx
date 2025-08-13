import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import backgroundImage from "/background.jpg";
import { Error, Success } from "../utils/toast";
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAppDispatch } from "../../store/store";
import { getAdmin } from "../../store/adminSlice";

const Login: React.FC = () => {
  const [username, setUsername] = useState("test@test.com");
  const [password, setPassword] = useState("test");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(getAdmin())
      .unwrap()
      .then((res) => {
        console.log(res);
      });
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (isLoading) return;
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate("/home");
        Success("You have been logged in successfully.");
      } else {
        Error("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      Error("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

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
            <h2 className="text-3xl font-bold text-text-primary mb-1">
              Welcome Back
            </h2>
            <p className="text-text-secondary">Sign in to your WMS Dashboard</p>
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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-border-secondary text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your username"
          />

          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-2"
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
              className="w-full px-3 py-2 pr-10 border border-border-secondary text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border-primary rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-text-secondary"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-500 hover:text-blue-400"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
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
