import { useState } from "react";
import { useAppSelector } from "../../store/store";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { fromatDateWithTime } from "../utils/utils";

const Profile: React.FC = () => {
  const { admin } = useAppSelector((state) => state.admin);
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.contact_number || "",
    location: admin?.location || "",
    role: admin?.role || "",
    department: admin?.department || "",
    joinDate: admin?.created_at || "",
  });

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
                  Joined {fromatDateWithTime(formData.joinDate)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-roboto border-border-secondary capitalize"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
