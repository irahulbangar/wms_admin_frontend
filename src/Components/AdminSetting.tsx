import {
  Settings,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Save,
  Shield,
  Palette,
  User,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Success, Error } from "../utils/toast";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const AdminSetting = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("theme");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));

    if (field === "newPassword") {
      setPasswordValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const isPasswordFormValid = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const isNewPasswordValid = Object.values(passwordValidation).every(Boolean);

    return (
      currentPassword &&
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      isNewPasswordValid
    );
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordFormValid()) {
      Error("Please fill all fields correctly and ensure passwords match.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    } catch {
      Error("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "theme",
      label: "Theme Settings",
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "password",
      label: "Change Password",
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer font-roboto ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-text-secondary hover:text-text-primary bg-secondary"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-primary border border-border-primary rounded-xl p-4 sm:p-6 shadow-sm">
        {activeTab === "theme" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-text-primary" />
              <h2 className="text-xl font-semibold text-text-primary font-roboto">
                Theme Settings
              </h2>
            </div>

            <div className="rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary font-roboto">
                    Current Theme
                  </h3>
                  <p className="text-sm text-text-secondary font-roboto">
                    {theme === "light" ? "Light Mode" : "Dark Mode"}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-input-bg border-input-border text-text-primary rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-status-info cursor-pointer"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="w-4 h-4" />
                      <span className="hidden sm:inline font-roboto">
                        Switch to Dark
                      </span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      <span className="hidden sm:inline font-roboto">
                        Switch to Light
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-text-primary" />
              <h2 className="text-xl font-semibold text-text-primary font-roboto">
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="w-full pl-4 pr-12 py-3 bg-input-bg font-roboto text-text-secondary border-input-border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info transition-all"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="w-full pl-4 pr-12 py-3 bg-input-bg font-roboto text-text-secondary border-input-border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info transition-all"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="w-full pl-4 pr-12 py-3 bg-input-bg font-roboto text-text-secondary border-input-border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info transition-all"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-status-danger font-roboto">
                    Passwords do not match
                  </p>
                )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-roboto sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-roboto">Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="font-roboto">Change Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-text-primary" />
              <h2 className="text-xl font-semibold text-text-primary font-roboto">
                Profile Settings
              </h2>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2 font-roboto">
                Profile Settings
              </h3>
              <p className="text-text-secondary font-roboto">
                Profile settings functionality coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSetting;
