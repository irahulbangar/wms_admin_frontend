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
} from "lucide-react";
import { Success, Info } from "../utils/toast";

const Profile: React.FC = () => {
  const { admin } = useAppSelector((state) => state.admin);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.contact_number || "",
    location: "New York, NY",
    role: admin?.role || "",
    department: "IT Department",
    joinDate: admin?.created_at || "",
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
      name: admin?.name || "",
      email: admin?.email || "",
      phone: admin?.contact_number || "",
      location: admin?.location || "",
      role: admin?.role || "",
      department: "IT Department",
      joinDate: admin?.created_at || "",
    });
    setIsEditing(false);
    Info("Changes cancelled. Profile data restored.");
  };

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-roboto">
          Profile Settings
        </h1>
        <p className="text-text-secondary mt-2 font-roboto">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border-primary rounded-xl p-6 shadow-sm font-roboto">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary font-roboto">
                {formData.name}
              </h2>
              <p className="text-text-secondary font-roboto">{formData.role}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-text-secondary font-roboto">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">{formData.email}</span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <Phone className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">{formData.phone}</span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">{formData.location}</span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <Calendar className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">
                  Joined {formData.joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border-primary rounded-xl p-6 shadow-sm font-roboto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary font-roboto">
                Personal Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-text-secondary hover:text-text-primary transition-colors p-2 rounded-md border border-border-primary bg-input-bg"
              >
                {isEditing ? (
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm font-roboto">
                  {isEditing ? "Cancel" : "Edit"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Role
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                  />
                ) : (
                  <p className="text-text-primary">{formData.role}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-roboto cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer transition-colors flex items-center font-roboto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
