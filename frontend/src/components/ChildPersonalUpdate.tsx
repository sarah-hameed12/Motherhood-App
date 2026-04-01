import { Save, X, User } from "lucide-react";
import { useState } from "react";
import type {UpdateChildPersonalProps} from "../interfaces/ChildInterfaces";

const UpdateChildPersonal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  child, 
  saving = false 
}: UpdateChildPersonalProps) => {
  const [formData, setFormData] = useState({
    firstname: child.firstname,
    lastname: child.lastname,
    profile_pic: child.profile_pic || "",
    gender: child.gender,
    date_of_birth: child.date_of_birth.split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstname: formData.firstname,
      lastname: formData.lastname,
      profile_pic: formData.profile_pic || undefined,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth
    });
  };

  const handleClose = () => {
    setFormData({
      firstname: child.firstname,
      lastname: child.lastname,
      profile_pic: child.profile_pic || "",
      gender: child.gender,
      date_of_birth: child.date_of_birth.split('T')[0]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[78vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-[#fceaea] rounded-lg">
                <User className="w-4 h-4 text-[#e5989b]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Update Personal Information</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Gender and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 text-sm appearance-none cursor-pointer pr-8"
                    required
                  >
                    <option value="" className="text-gray-400">Select Gender</option>
                    <option value="male" className="text-gray-800">Male</option>
                    <option value="female" className="text-gray-800">Female</option>
                    <option value="other" className="text-gray-800">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 text-sm cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Profile Picture URL */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                Profile Picture URL
              </label>
              <input
                type="url"
                name="profile_pic"
                value={formData.profile_pic}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm"
                placeholder="https://example.com/photo.jpg"
              />
              {formData.profile_pic && (
                <div className="mt-1 sm:mt-2 flex items-center space-x-2 sm:space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-600">Preview:</span>
                  <img
                    src={formData.profile_pic}
                    alt="Preview"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Spacer to ensure buttons don't overlap content */}
            <div className="h-16 sm:h-20"></div>
          </form>
        </div>

        {/* Sticky Buttons - Outside the scrollable content */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-5 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 border border-transparent hover:border-gray-300 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.firstname || !formData.lastname || !formData.gender || !formData.date_of_birth}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-[#e5989b] to-[#d28386] text-white py-2 sm:py-2.5 rounded-lg font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateChildPersonal;