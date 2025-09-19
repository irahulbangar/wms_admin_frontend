import { useAppSelector } from "../../store/store";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { fromatDateWithTime } from "../utils/utils";

const Profile: React.FC = () => {
  const { admin } = useAppSelector((state) => state.admin);

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
                {admin?.name}
              </h2>
              <p className="text-text-secondary font-roboto">{admin?.role}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-text-secondary font-roboto">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">{admin?.email}</span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <Phone className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">
                  {admin?.contact_number}
                </span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">{admin?.location}</span>
              </div>
              <div className="flex items-center text-text-secondary font-roboto">
                <Calendar className="w-4 h-4 mr-3" />
                <span className="text-sm font-roboto">
                  Joined {fromatDateWithTime(admin?.created_at || "")}
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
                  disabled
                  value={admin?.name}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={admin?.email}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Phone
                </label>
                <input
                  type="tel"
                  disabled
                  value={admin?.contact_number}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Location
                </label>
                <input
                  type="text"
                  disabled
                  value={admin?.location}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  value={admin?.department}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-roboto">
                  Role
                </label>
                <input
                  type="text"
                  disabled
                  value={admin?.role}
                  className="w-full px-3 py-2 border text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none transition-colors font-roboto border-border-primary capitalize"
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
