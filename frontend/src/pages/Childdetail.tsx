import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRequest, putRequest, deleteRequest } from "../api/requests";
import { ArrowLeft, Calendar, Edit3, Trash2, User, Ruler, Droplets, Weight, Brain } from "lucide-react";
import UpdateChildPersonal from "../components/ChildPersonalUpdate";
import UpdateChildPhysical from "../components/ChildPhysicalUpdate";
import type { ChildFull as Child } from "../interfaces/ChildInterfaces";


interface PersonalInfoSectionProps {
  child: Child;
  onEdit: () => void;
}

interface PhysicalInfoSectionProps {
  child: Child;
  onEdit: () => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  child: Child;
  deleting: boolean;
}

// Personal Info Section Component
const PersonalInfoSection = ({ child, onEdit }: PersonalInfoSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-white to-[#fff8f8] rounded-xl border border-[#f3d0d2] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-[#fceaea] rounded-lg sm:rounded-xl">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h2>
        </div>
        
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 sm:space-x-2 bg-[#e5989b] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#d28386] transition-colors duration-200 shadow-sm text-sm sm:text-base"
        >
          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:space-x-6">
        <div className="relative group">
          <img
            src={child.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={`${child.firstname} ${child.lastname}`}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Photo
            </span>
          </div>
        </div>
        
        <div className="text-center sm:text-left space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 bg-gradient-to-r from-[#e5989b] to-[#d28386] bg-clip-text text-transparent">
              {child.firstname} {child.lastname}
            </h3>
            <p className="text-gray-600 capitalize mt-1 text-sm sm:text-base">{child.gender}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#e5989b]" />
              <span>{new Date(child.date_of_birth).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <div>
              <span className="text-gray-900 font-semibold">
                {Math.floor((new Date().getTime() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Physical Info Section Component
const PhysicalInfoSection = ({ child, onEdit }: PhysicalInfoSectionProps) => {
  const stats = [
    { 
      label: "Blood Type", 
      value: child.blood_type || "Not set", 
      icon: Droplets,
      color: "from-red-50 to-red-100",
      iconColor: "text-red-600"
    },
    { 
      label: "Height", 
      value: child.height ? `${child.height} cm` : "Not set", 
      icon: Ruler,
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600"
    },
    { 
      label: "Weight", 
      value: child.weight ? `${child.weight} kg` : "Not set", 
      icon: Weight,
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600"
    },
    { 
      label: "Head Circumference", 
      value: child.head_circumference ? `${child.head_circumference} cm` : "Not set", 
      icon: Brain,
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-[#fff8f8] rounded-xl border border-[#f3d0d2] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-[#fceaea] rounded-lg sm:rounded-xl">
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Physical Information</h2>
        </div>
        
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 sm:space-x-2 bg-[#e5989b] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#d28386] transition-colors duration-200 shadow-sm text-sm sm:text-base"
        >
          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1`}
          >
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-sm sm:text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, child, deleting }: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg sm:rounded-xl">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Delete Child Profile</h3>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {child.firstname} {child.lastname}
            </span>
            's profile? This action cannot be undone.
          </p>

          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              {deleting ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ChildDetail Component
const ChildDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPersonalEdit, setShowPersonalEdit] = useState(false);
  const [showPhysicalEdit, setShowPhysicalEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchChildDetail = async () => {
    try {
      const response = await getRequest(`/child/detail/${id}`);
      setChild(response);
    } catch (error) {
      console.error("Error fetching child detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildDetail();
  }, [id]);

  const handlePersonalSave = async (data: {
    firstname: string;
    lastname: string;
    profile_pic?: string;
    gender: string;
    date_of_birth: string;
  }) => {
    if (!child) return;
    
    try {
      setSaving(true);
      await putRequest(`/child/update-personal-info/${child.id}`, data);
      setShowPersonalEdit(false);
      await fetchChildDetail();
    } catch (err) {
      console.error("Error updating personal info:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhysicalSave = async (data: {
    blood_type?: string;
    height?: number;
    weight?: number;
    head_circumference?: number;
  }) => {
    if (!child) return;
    
    try {
      setSaving(true);
      await putRequest(`/child/update-physical-info/${child.id}`, data);
      setShowPhysicalEdit(false);
      await fetchChildDetail();
    } catch (err) {
      console.error("Error updating physical info:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!child) return;
    
    try {
      setDeleting(true);
      await deleteRequest(`/child/delete/${id}`);
      setShowConfirm(false);
      navigate("/", { 
        state: { 
          message: `${child.firstname} ${child.lastname}'s profile has been deleted successfully.`,
          type: "success"
        }
      });
    } catch (err) {
      console.error("Error deleting child:", err);
      alert("Failed to delete child. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePersonalEdit = () => {
    setShowPersonalEdit(true);
  };

  const handlePhysicalEdit = () => {
    setShowPhysicalEdit(true);
  };

  const isModalOpen = showPersonalEdit || showPhysicalEdit || showConfirm;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <p className="text-gray-600 text-base sm:text-lg">Loading child details...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] flex flex-col items-center justify-center text-gray-600 p-4">
        <div className="text-center">
          <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-lg sm:text-xl mb-3 sm:mb-4">Child details not found.</p>
          <Link
            to="/"
            className="inline-flex items-center text-[#e5989b] hover:text-[#d28386] font-medium text-base sm:text-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content with Conditional Blur */}
      <div className={`min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] py-2 sm:py-2 px-3 sm:px-3 lg:px-4 transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-1 sm:mb-2">
            <Link
              to="/"
              className="inline-flex items-center text-[#e5989b] hover:text-[#d28386] font-medium transition-colors duration-200 group text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </Link>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
              className="inline-flex items-center bg-white text-red-600 border border-red-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Delete Profile
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            <PersonalInfoSection child={child} onEdit={handlePersonalEdit} />
            <PhysicalInfoSection child={child} onEdit={handlePhysicalEdit} />
          </div>
        </div>
      </div>

      {/* Modals - Outside the blurred container */}
      <UpdateChildPersonal
        isOpen={showPersonalEdit}
        onClose={() => setShowPersonalEdit(false)}
        onSave={handlePersonalSave}
        child={child}
        saving={saving}
      />

      <UpdateChildPhysical
        isOpen={showPhysicalEdit}
        onClose={() => setShowPhysicalEdit(false)}
        onSave={handlePhysicalSave}
        child={child}
        saving={saving}
      />

      <DeleteConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        child={child}
        deleting={deleting}
      />
    </>
  );
};

export default ChildDetail;