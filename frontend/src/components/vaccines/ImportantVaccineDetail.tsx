import { X, Calendar, Clock, Info, Shield, CheckCircle, ShieldAlert, Bell, Share2, Download, ChevronLeft } from "lucide-react";
import type { VaccineUserView } from "../../interfaces/VaccinationInterfaces";
import { useEffect, useState } from "react";

interface VaccineDetailModalProps {
  vaccine: VaccineUserView;
  daysToReadableAge: (days: number) => string;
  getVaccineIcon: (name: string) => React.ReactNode;
  onClose: () => void;
}

const getDetailedAge = (days: number | undefined | null): string => {
  if (days === undefined || days === null || isNaN(days) || days < 0) {
    return 'Not specified';
  }
  
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const weeks = Math.floor((days % 30) / 7);
  const remainingDays = Math.floor(days % 7);
  
  const parts = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
  if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays !== 1 ? 's' : ''}`);
  
  if (parts.length === 0 && days === 0) {
    return '0 days';
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Not specified';
};

const safeDaysToReadableAge = (days: number | undefined | null): string => {
  if (days === undefined || days === null || isNaN(days) || days < 0) {
    return 'Not specified';
  }
  
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
};

const calculateWindow = (minDays: number | undefined | null, maxDays: number | undefined | null): { duration: string; totalDays: number | string } => {
  if (minDays === undefined || minDays === null || maxDays === undefined || maxDays === null || 
      isNaN(minDays) || isNaN(maxDays) || minDays < 0 || maxDays < 0) {
    return { duration: 'Not specified', totalDays: 'N/A' };
  }
  
  const windowDays = maxDays - minDays;
  if (windowDays < 0) return { duration: 'Invalid range', totalDays: 'N/A' };
  
  return {
    duration: safeDaysToReadableAge(windowDays),
    totalDays: windowDays
  };
};

const VaccineDetailModal = ({ vaccine, getVaccineIcon, onClose }: VaccineDetailModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Check if vaccine description is available
  const hasDescription = vaccine.vaccine_description && vaccine.vaccine_description.trim().length > 0;
  
  // Check if we have schedules
  const hasSchedules = vaccine.schedules && vaccine.schedules.length > 0;
  
  // Get total duration of vaccination schedule
  const getTotalScheduleDuration = () => {
    if (!hasSchedules) return { duration: 'N/A', totalDays: 'N/A' };
    
    const firstDose = vaccine.schedules[0];
    const lastDose = vaccine.schedules[vaccine.schedules.length - 1];
    
    if (!firstDose || !lastDose) return { duration: 'N/A', totalDays: 'N/A' };
    
    return calculateWindow(firstDose.min_age_days, lastDose.max_age_days);
  };

  const totalScheduleDuration = getTotalScheduleDuration();

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-all duration-300"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl sm:shadow-3xl border border-gray-200 w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 px-4 py-3 flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-sm font-bold text-gray-900 truncate px-2 max-w-[60vw]">
                {vaccine.vaccine_name}
              </h2>
              <div className="w-10"></div>
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <div className="relative px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-lg sm:rounded-xl shadow-lg">
                    {getVaccineIcon(vaccine.vaccine_name)}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {vaccine.vaccine_name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${vaccine.is_mandatory ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {vaccine.is_mandatory ? 'Mandatory' : 'Recommended'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600">
                        ID: {vaccine.vaccine_option_id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors group"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(95vh-56px)] sm:max-h-[calc(90vh-80px)] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Basic Info & Schedule */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {/* Description - Only show if available */}
                {hasDescription && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
                      Description
                    </h3>
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {vaccine.vaccine_description}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Vaccine Summary - Always show */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Vaccine Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className={`font-bold ${vaccine.is_mandatory ? 'text-red-600' : 'text-blue-600'}`}>
                        {vaccine.is_mandatory ? 'Mandatory' : 'Recommended'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Total Doses</p>
                      <p className="text-xl font-bold text-gray-900">{vaccine.doses_needed || 0}</p>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Schedule Phases</p>
                      <p className="text-xl font-bold text-gray-900">
                        {vaccine.schedules?.length || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Total Duration</p>
                      <p className="text-sm font-bold text-gray-900">
                        {totalScheduleDuration.duration}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Schedule Timeline - Only show if we have schedules */}
                {hasSchedules ? (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
                      Vaccination Schedule ({vaccine.schedules.length} doses)
                    </h3>
                    <div className="relative">
                      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#e5989b] via-[#e5989b]/50 to-transparent hidden sm:block"></div>
                      
                      <div className="space-y-4 sm:space-y-6">
                        {vaccine.schedules.map((schedule, index) => {
                          const windowInfo = calculateWindow(schedule.min_age_days, schedule.max_age_days);
                          
                          return (
                            <div key={`${schedule.dose_num}-${index}`} className="relative flex items-start gap-4 sm:gap-6">
                              <div className="relative z-10 flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#e5989b] to-[#d88a8d] flex items-center justify-center shadow-lg">
                                  <span className="text-xs sm:text-sm font-bold text-white">#{schedule.dose_num}</span>
                                </div>
                                {index < vaccine.schedules.length - 1 && (
                                  <div className="absolute left-1/2 top-10 sm:top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#e5989b]/30 to-transparent -translate-x-1/2 hidden sm:block"></div>
                                )}
                              </div>
                              
                              <div className="flex-1 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg sm:text-xl">Dose {schedule.dose_num}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {schedule.min_age_days >= 0 ? 
                                        `${safeDaysToReadableAge(schedule.min_age_days)} to ${safeDaysToReadableAge(schedule.max_age_days)}` : 
                                        'Age not specified'
                                      }
                                    </p>
                                  </div>
                                  <span className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] text-[#e5989b] rounded-full whitespace-nowrap">
                                    Window: {windowInfo.duration}
                                  </span>
                                </div>
                                
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                        <p className="text-xs sm:text-sm font-medium text-gray-700">Earliest Age</p>
                                      </div>
                                      <p className="font-bold text-gray-900 text-base sm:text-lg">
                                        {safeDaysToReadableAge(schedule.min_age_days)}
                                      </p>
                                      <div className="mt-1 sm:mt-2 space-y-1">
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">Detailed:</span> {getDetailedAge(schedule.min_age_days)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {schedule.min_age_days || 0} days
                                        </p>
                                      </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                        <p className="text-xs sm:text-sm font-medium text-gray-700">Latest Age</p>
                                      </div>
                                      <p className="font-bold text-gray-900 text-base sm:text-lg">
                                        {safeDaysToReadableAge(schedule.max_age_days)}
                                      </p>
                                      <div className="mt-1 sm:mt-2 space-y-1">
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">Detailed:</span> {getDetailedAge(schedule.max_age_days)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {schedule.max_age_days || 0} days
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Recommended Age Window</p>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                      <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-600">Duration</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                                          {windowInfo.duration}
                                        </p>
                                      </div>
                                      <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-600">Total Days</p>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                                          {windowInfo.totalDays}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-6 text-center">
                    <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">No Schedule Available</h4>
                    <p className="text-gray-600">Schedule information for this vaccine is not currently available.</p>
                  </div>
                )}
              </div>
              
              {/* Right Column - Stats & Actions */}
              <div className="space-y-6 sm:space-y-8">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Vaccine Details</h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${vaccine.is_mandatory ? 'bg-red-100' : 'bg-blue-100'}`}>
                          {vaccine.is_mandatory ? (
                            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Vaccine Type</p>
                          <p className={`font-bold text-lg ${vaccine.is_mandatory ? 'text-red-700' : 'text-blue-700'}`}>
                            {vaccine.is_mandatory ? 'Mandatory Vaccine' : 'Recommended Vaccine'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Vaccine ID</p>
                        <p className="text-sm font-mono text-gray-800 break-all">
                          {vaccine.vaccine_option_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Doses</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vaccine.doses_needed || 0}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Schedule Phases</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {vaccine.schedules?.length || 0}
                        </p>
                      </div>
                    </div>
                    
                    {hasSchedules && (
                      <div className="bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">Complete Schedule Duration</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-base sm:text-lg">
                            {totalScheduleDuration.duration}
                          </span>
                          <span className="text-xs text-gray-600">
                            {totalScheduleDuration.totalDays !== 'N/A' ? `${totalScheduleDuration.totalDays} days` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 sm:space-y-4">
                  <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg group active:scale-[0.98]">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                    <span>Set Reminder</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white border-2 border-[#e5989b] text-[#e5989b] py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-[#e5989b] hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg group active:scale-[0.98]">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Share Information</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gray-100 text-gray-700 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-sm sm:text-base md:text-lg active:scale-[0.98]">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Download Details</span>
                  </button>
                </div>
                
                {/* Important Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200 p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl flex-shrink-0">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Important Information</h5>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Follow the complete schedule for full protection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Consult your healthcare provider for personalized advice</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Keep track of all vaccination dates</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #e5989b, #d88a8d);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d88a8d, #e5989b);
        }
        
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </>
  );
};

export default VaccineDetailModal;