import { useState } from "react";
import { useAppSelector } from "../../store/store";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Settings,
  Bell,
} from "lucide-react";
import { Success, Info } from "../utils/toast";

const Profile: React.FC = () => {
  const { admin } = useAppSelector((state) => state.admin);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Jhon Doe",
    email: admin?.email || "",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    role: "Administrator",
    department: "IT Department",
    joinDate: "January 2024",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving profile data:", formData);
    setIsEditing(false);
    Success("Profile updated successfully!");
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: "Jhon Doe",
      email: admin?.email || "",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      role: "Administrator",
      department: "IT Department",
      joinDate: "January 2024",
    });
    setIsEditing(false);
    Info("Changes cancelled. Profile data restored.");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Profile Settings
        </h1>
        <p className="text-text-secondary mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border-primary rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {formData.name}
              </h2>
              <p className="text-text-secondary">{formData.role}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-text-secondary">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm">{formData.email}</span>
              </div>
              <div className="flex items-center text-text-secondary">
                <Phone className="w-4 h-4 mr-3" />
                <span className="text-sm">{formData.phone}</span>
              </div>
              <div className="flex items-center text-text-secondary">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="text-sm">{formData.location}</span>
              </div>
              <div className="flex items-center text-text-secondary">
                <Calendar className="w-4 h-4 mr-3" />
                <span className="text-sm">Joined {formData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border-primary rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                Personal Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
              >
                {isEditing ? (
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm">{isEditing ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full bg-input-bg border-input-border rounded-lg"
                  />
                ) : (
                  <p className="text-text-primary">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full bg-input-bg border-input-border rounded-lg"
                  />
                ) : (
                  <p className="text-text-primary">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full bg-input-bg border-input-border rounded-lg"
                  />
                ) : (
                  <p className="text-text-primary">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full bg-input-bg border-input-border rounded-lg"
                  />
                ) : (
                  <p className="text-text-primary">{formData.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className="w-full bg-input-bg border-input-border rounded-lg"
                  />
                ) : (
                  <p className="text-text-primary">{formData.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Role
                </label>
                <p className="text-text-primary">{formData.role}</p>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border-primary rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-text-secondary mr-3" />
                  <div>
                    <p className="text-text-primary font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-text-secondary text-sm">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-hover-bg-primary transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-text-secondary mr-3" />
                  <div>
                    <p className="text-text-primary font-medium">
                      Email Notifications
                    </p>
                    <p className="text-text-secondary text-sm">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Enabled
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-text-secondary mr-3" />
                  <div>
                    <p className="text-text-primary font-medium">
                      Privacy Settings
                    </p>
                    <p className="text-text-secondary text-sm">
                      Manage your privacy preferences
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-hover-bg-primary transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
