import { Save, X, Ruler } from "lucide-react";
import { useState } from "react";

import type { UpdateChildPhysicalProps } from "../interfaces/ChildInterfaces";

const UpdateChildPhysical = ({ 
  isOpen, 
  onClose, 
  onSave, 
  child, 
  saving = false 
}: UpdateChildPhysicalProps) => {
  const [formData, setFormData] = useState({
    blood_type: child.blood_type || "",
    height: child.height || "",
    weight: child.weight || "",
    head_circumference: child.head_circumference || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      blood_type: formData.blood_type || undefined,
      height: formData.height ? parseFloat(formData.height as string) : undefined,
      weight: formData.weight ? parseFloat(formData.weight as string) : undefined,
      head_circumference: formData.head_circumference ? parseFloat(formData.head_circumference as string) : undefined
    });
  };

  const handleClose = () => {
    setFormData({
      blood_type: child.blood_type || "",
      height: child.height || "",
      weight: child.weight || "",
      head_circumference: child.head_circumference || ""
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
                <Ruler className="w-4 h-4 text-[#e5989b]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Update Physical Information</h2>
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
            {/* Blood Type and Height */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Blood Type
                </label>
                <div className="relative">
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 text-sm appearance-none cursor-pointer pr-8"
                  >
                    <option value="" className="text-gray-400">Select Blood Type</option>
                    <option value="A+" className="text-gray-800">A+</option>
                    <option value="A-" className="text-gray-800">A-</option>
                    <option value="B+" className="text-gray-800">B+</option>
                    <option value="B-" className="text-gray-800">B-</option>
                    <option value="AB+" className="text-gray-800">AB+</option>
                    <option value="AB-" className="text-gray-800">AB-</option>
                    <option value="O+" className="text-gray-800">O+</option>
                    <option value="O-" className="text-gray-800">O-</option>
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
                  Height (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm pr-10"
                    placeholder="Enter height"
                    step="0.1"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-xs sm:text-sm">cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight and Head Circumference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Weight (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm pr-10"
                    placeholder="Enter weight"
                    step="0.1"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-xs sm:text-sm">kg</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                  Head Circumference (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="head_circumference"
                    value={formData.head_circumference}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-400 text-gray-800 text-sm pr-10"
                    placeholder="Enter circumference"
                    step="0.1"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-xs sm:text-sm">cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurement Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Measurement Tips</h4>
              <ul className="text-xs text-blue-600 space-y-0.5 sm:space-y-1">
                <li>• Height: Measure without shoes, standing straight against a wall</li>
                <li>• Weight: Use a calibrated scale on a flat surface</li>
                <li>• Head Circumference: Measure around the widest part of the head</li>
              </ul>
            </div>

            {/* Spacer to ensure buttons don't overlap content */}
            <div className="h-16 sm:h-20"></div>
          </form>
        </div>

        {/* Sticky Buttons - Now outside the scrollable content */}
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
              disabled={saving}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-[#e5989b] to-[#d28386] text-white py-2 sm:py-2.5 rounded-lg font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm shadow-sm hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100"
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

export default UpdateChildPhysical;