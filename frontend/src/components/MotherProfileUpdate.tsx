import { useState } from "react";
import { putRequest } from "../api/requests";
import { 
  MapPin, 
  Calendar, 
  Droplets,
  Save,
  X,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Person {
  firstname: string;
  lastname: string;
  address: string;
  city: string;
  country: string;
  date_of_birth: string;
  blood_type: string;
}

interface MotherProfileUpdateProps {
  motherData: Person & {
    id: string;
    email: string;
    phone_number: string;
    profile_pic?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const MotherProfileUpdate = ({ motherData, onClose, onSuccess }: MotherProfileUpdateProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Person>({
    firstname: motherData.firstname,
    lastname: motherData.lastname,
    address: motherData.address || "",
    city: motherData.city || "",
    country: motherData.country || "",
    date_of_birth: motherData.date_of_birth ? motherData.date_of_birth.split('T')[0] : "",
    blood_type: motherData.blood_type || ""
  });

  // Blood type options
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.firstname || !formData.lastname) {
        setError("First name and last name are required");
        setSaving(false);
        return;
      }

      // Validate date of birth
      if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        if (birthDate > today) {
          setError("Date of birth cannot be in the future");
          setSaving(false);
          return;
        }
      }

      // Prepare data for API
      const updateData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null
      };

      console.log("Form: ", formData);

      await putRequest('/user-profile/update', updateData);
      
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col mx-auto">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[#fceaea] border border-[#e5989b]/20 mb-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e5989b] rounded-full animate-pulse mr-1.5 sm:mr-2"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Update Profile</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Edit Personal Details</h2>
              <p className="text-gray-600 text-xs sm:text-sm truncate">
                Update your basic information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 flex-shrink-0"
            disabled={saving}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Messages - Fixed */}
        <div className="flex-shrink-0">
          {success && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-green-800 font-medium text-sm sm:text-base">Profile updated successfully!</p>
                <p className="text-green-600 text-xs sm:text-sm">Closing this window...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-red-800 font-medium text-sm sm:text-base">Error</p>
                <p className="text-red-600 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="firstname" className="block text-sm font-semibold text-gray-800">
                  First Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    required
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base"
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="lastname" className="block text-sm font-semibold text-gray-800">
                  Last Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    required
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-800">
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Blood Type - Fixed for mobile */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="blood_type" className="block text-sm font-semibold text-gray-800">
                  Blood Type
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <select
                    id="blood_type"
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base appearance-none cursor-pointer"
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2 sm:space-y-3">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-800">
                  Address
                </label>
                <div className="relative group">
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white resize-none text-sm sm:text-base"
                    placeholder="Enter your street address"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="city" className="block text-sm font-semibold text-gray-800">
                  City
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="country" className="block text-sm font-semibold text-gray-800">
                  Country
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 group-hover:border-gray-400 bg-white text-sm sm:text-base"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-500">
                Fields marked with * are required
              </p>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-8 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-all duration-200 font-medium hover:shadow-sm text-sm sm:text-base order-2 sm:order-1"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-xl hover:from-[#d88a8d] hover:to-[#e5989b] transition-all duration-200 font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="whitespace-nowrap">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5989b;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d88a8d;
        }
        
        /* Fix for date input on mobile */
        @media (max-width: 640px) {
          input[type="date"] {
            min-height: 44px; /* Better touch target */
          }
          select {
            min-height: 44px; /* Better touch target */
          }
        }
      `}</style>
    </div>
  );
};

export default MotherProfileUpdate;