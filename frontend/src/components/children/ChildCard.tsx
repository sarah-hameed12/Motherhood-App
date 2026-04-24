import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  TrendingUp,
  MoreVertical,
  Syringe,
  AlertCircle,
  Calendar,
  Heart,
  User,
  ChevronRight,
  X
} from "lucide-react";

import ChildVaccination from "../vaccines/ChildVaccination";
import type { ChildMini } from "../../interfaces/ChildrenInterfaces";

interface ChildCardProps {
  child: ChildMini;
  activeMenu: string | null;
  onToggleMenu: (childId: string) => void;
}

// Define extended interface for computed/optional properties
interface ChildWithComputed extends ChildMini {
  growthStatus?: string;
  upcomingVaccines?: number;
  nextVaccination?: string;
}

const ChildCardChildrenPage = ({ child, activeMenu, onToggleMenu }: ChildCardProps) => {

  console.log(child)
  console.log(activeMenu)
  console.log(onToggleMenu)

  const [showVaccinationPopup, setShowVaccinationPopup] = useState(false);

  // Type guard to safely access optional properties
  const safeChild = child as ChildWithComputed;

  // Apply blur effect to header and sidebar when popup opens
  useEffect(() => {
    if (showVaccinationPopup) {
      const header = document.querySelector('header');
      
      if (header) {
        header.classList.add('blur-sm');
        header.style.pointerEvents = 'none';
        header.style.zIndex = '0';
      }

      return () => {
        if (header) {
          header.classList.remove('blur-sm');
          header.style.pointerEvents = 'auto';
          header.style.zIndex = '40';
        }
      };
    }
  }, [showVaccinationPopup]);

  // Calculate age in days
  const calculateAgeInDays = (birthDate: string) => {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate age in years, months, and days for display
  const calculateAgeDisplay = (birthDate: string) => {
    if (!birthDate) return "N/A";

    const birth = new Date(birthDate);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);

    return parts.length > 0 ? parts.join(" ") : "0d";
  };

  const getGrowthStatusColor = (status?: string) => {
    const actualStatus = status || "normal";
    switch (actualStatus) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-[#e5989b] bg-[#fceaea] border-[#e5989b]/20";
      case "normal":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Safely access optional properties with defaults
  const growthStatus = safeChild.growthStatus || "normal";
  const hasGrowthAlert = growthStatus === "normal" || growthStatus === "poor";
  const upcomingVaccines = safeChild.upcomingVaccines || 0;
  const hasVaccinationAlert = upcomingVaccines > 0;

  const childFullName = `${child.firstname} ${child.lastname}`;
  const childAgeInDays = calculateAgeInDays(child.date_of_birth);

  const handleCloseVaccination = () => {
    setShowVaccinationPopup(false);
  };

  return (
    <>
      {/* Backdrop blur - covers entire screen */}
      {showVaccinationPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-in fade-in duration-200" onClick={handleCloseVaccination} />
      )}

      <div>
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-[#e5989b]/30 ${showVaccinationPopup ? 'pointer-events-none opacity-50' : ''}`}>
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <Link
              to={`/child/${child.id}`}
              className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0"
            >
              <div className="relative">
                <img
                  src={
                    child.profile_pic ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={childFullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#e5989b]/20 hover:border-[#e5989b]/40 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#e5989b] text-white rounded-full p-0.5">
                  <User className="w-3 h-3" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {childFullName}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                  <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                    {child.gender}
                  </span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <div className="flex items-center text-sm text-[#e5989b] font-medium bg-[#fceaea] px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3 mr-1" />
                    {calculateAgeDisplay(child.date_of_birth)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getGrowthStatusColor(growthStatus)}`}>
                    {growthStatus.charAt(0).toUpperCase() + growthStatus.slice(1)} Growth
                  </span>
                </div>
              </div>
            </Link>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu(child.id);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {activeMenu === child.id && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => onToggleMenu("")}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2">
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Edit className="w-4 h-4 mr-3 text-gray-500" />
                        Edit Profile
                      </button>
                      <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <TrendingUp className="w-4 h-4 mr-3 text-gray-500" />
                        View Growth Chart
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 mr-3" />
                        Delete Child
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards - Responsive grid (removed milestones card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Vaccines Due Card */}
            <div className={`flex items-center p-3 rounded-xl border transition-all hover:scale-[1.02] ${hasVaccinationAlert
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
              }`}>
              <div className="relative mr-3">
                <div className={`p-2 rounded-lg ${hasVaccinationAlert ? "bg-red-100" : "bg-green-100"
                  }`}>
                  <Syringe className={`w-4 h-4 sm:w-5 sm:h-5 ${hasVaccinationAlert ? "text-red-500" : "text-green-500"
                    }`} />
                </div>
                {hasVaccinationAlert && (
                  <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${hasVaccinationAlert ? "text-red-600" : "text-green-600"
                  } truncate`}>
                  Vaccines Due
                </p>
                <p className={`font-semibold text-sm sm:text-base ${hasVaccinationAlert ? "text-red-700" : "text-green-700"
                  }`}>
                  {upcomingVaccines}
                </p>
                {safeChild.nextVaccination && (
                  <p className="text-xs text-gray-500 truncate">
                    Next: {new Date(safeChild.nextVaccination).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Health Status Card */}
            <div className={`flex items-center p-3 rounded-xl border transition-all hover:scale-[1.02] ${hasGrowthAlert
              ? "bg-yellow-50 border-yellow-200"
              : "bg-[#f0f7ff] border-[#e5989b]/10"
              }`}>
              <div className="relative mr-3">
                <div className={`p-2 rounded-lg ${hasGrowthAlert ? "bg-yellow-100" : "bg-[#e5989b]/10"
                  }`}>
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${hasGrowthAlert ? "text-yellow-600" : "text-[#e5989b]"
                    }`} />
                </div>
                {hasGrowthAlert && (
                  <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Health Status</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base capitalize">
                    {growthStatus}
                  </p>
                  {hasGrowthAlert && (
                    <span className="text-xs text-yellow-600 font-medium">Monitor</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Stack on mobile (removed milestones button) */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-100">
            <Link
              to={`/child/${child.id}/growth`}
              className="flex-1 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-center py-2.5 px-4 rounded-lg hover:from-[#d88a8d] hover:to-[#cb7c7f] transition-all duration-300 text-sm font-medium relative group overflow-hidden"
            >
              <div className="flex items-center justify-center relative z-10">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Growth
              </div>
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </Link>

            {/* Vaccinations Button - Now opens popup */}
            <button
              onClick={() => setShowVaccinationPopup(true)}
              className="flex-1 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-center py-2.5 px-4 rounded-lg hover:from-[#d88a8d] hover:to-[#cb7c7f] transition-all duration-300 text-sm font-medium relative group overflow-hidden"
            >
              <div className="flex items-center justify-center relative z-10">
                <Syringe className="w-4 h-4 mr-2" />
                Vaccinations
                {hasVaccinationAlert && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                    {upcomingVaccines}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          </div>

          {/* Quick View Profile Link */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              to={`/child/${child.id}`}
              className="flex items-center justify-center text-[#e5989b] hover:text-[#d88a8d] transition-colors text-sm font-medium group"
            >
              <span>View Full Profile</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Vaccination Modal Popup */}
      {showVaccinationPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-16">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-120px)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header with Close Button - Fixed at top */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Vaccination Schedule
                  </h2>
                  <p className="text-sm text-gray-600">For: {childFullName}</p>
                </div>
              </div>
              <button
                onClick={handleCloseVaccination}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto scrollbar-cute flex-1 min-h-0">
              <ChildVaccination
                child_id={child.id}
                fullname={childFullName}
                age={childAgeInDays}
                onClose={handleCloseVaccination}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChildCardChildrenPage;