import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../api/requests";
import { Baby, X, Heart, Sparkles, Camera, CheckCircle, PartyPopper } from "lucide-react";

interface AddChildProps {
  onClose?: () => void;
}

interface FormData {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  profile_pic: string;
}

const AddChild: React.FC<AddChildProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    gender: "",
    date_of_birth: "",
    profile_pic: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => ({ ...prev, profile_pic: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname || !formData.gender || !formData.date_of_birth) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, profile_pic: avatarPreview || "" };
      await postRequest("/child/create", payload);
      
      // Show success message
      setSuccessMessage(`${formData.firstname} has been added! 🎉`);
      setShowSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
        navigate("/");
      }, 2000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to create child. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white relative">
      <div className="p-4 sm:p-5">
        <form onSubmit={handleSubmit}>
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-[#e5989b] to-[#d88a8d] -mt-4 -mx-4 sm:-mt-5 sm:-mx-5 mb-4 p-2.5 text-center relative overflow-hidden rounded-t-xl">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1 shadow-md animate-bounce-slow">
                <Baby className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-bold text-white mb-0.5">Add New Child</h1>
              <p className="text-white/80 text-[10px]">Welcome your little one</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Circular Avatar - Smaller */}
            <div className="text-center">
              <div className="relative inline-block group">
                <div 
                  className={`w-20 h-20 rounded-full border-3 transition-all duration-300 overflow-hidden shadow-md cursor-pointer ${
                    avatarPreview 
                      ? 'border-[#e5989b] bg-white' 
                      : 'border-[#e5989b]/40 bg-gradient-to-br from-[#fceaea] to-[#f9eae8] hover:border-[#e5989b] hover:shadow-lg'
                  }`}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  {avatarPreview ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt="Child avatar"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAvatar();
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-all duration-200 shadow-md hover:scale-110"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Camera className="w-5 h-5 text-[#e5989b] mb-0.5" />
                      <span className="text-[9px] text-[#e5989b] font-medium">Add</span>
                    </div>
                  )}
                </div>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields - Ultra Compact */}
            <div className="w-full space-y-2">
              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-semibold text-gray-700">
                    First <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => handleInputChange("firstname", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700 text-xs"
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="block text-[10px] font-semibold text-gray-700">
                    Last <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => handleInputChange("lastname", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700 text-xs"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              {/* Gender and DOB Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-semibold text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700 text-xs appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">👦 Male</option>
                    <option value="Female">👧 Female</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="block text-[10px] font-semibold text-gray-700">
                    DOB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700 text-xs cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button - Ultra Compact */}
          <div className="mt-4 pt-2 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`w-full py-2 text-white font-semibold rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 text-xs ${
                loading
                  ? "bg-gradient-to-r from-[#e5989b]/70 to-[#d88a8d]/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#e5989b] to-[#d88a8d] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Heart className={`w-3.5 h-3.5 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`} />
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </div>

          {/* Footer - Minimal */}
          <div className="mt-2 text-center">
            <p className="text-[9px] text-gray-400 flex items-center justify-center gap-1">
              <Sparkles className="w-2 h-2" />
              Safe & secure
              <Sparkles className="w-2 h-2" />
            </p>
          </div>
        </form>
      </div>

      {/* Cute Success Popup */}
      {showSuccess && (
        <>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="animate-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-4 min-w-[280px] text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping">
                      <PartyPopper className="w-12 h-12 text-yellow-300" />
                    </div>
                    <CheckCircle className="w-12 h-12 text-white relative z-10" />
                  </div>
                  <h3 className="text-white font-bold text-base">Success! 🎉</h3>
                  <p className="text-white/90 text-sm">{successMessage}</p>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        
        .zoom-in {
          animation-name: zoom-in;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .animate-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AddChild;