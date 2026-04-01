import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Syringe,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Baby,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { postRequest } from "../api/requests";

// Type Definitions
interface VaccineDoseInfo {
  dose_num: number;
  dose_name: string;
  schedule_id: string;
  min_age_days: number;
  max_age_days: number | null;
  child_current_age_days: number;
  is_age_eligible: boolean;
}

interface PendingVaccine {
  vaccine_id: string;
  vaccine_name: string;
  description: string | null;
  protect_against: string | null;
  is_mandatory: boolean;
  doses_needed: number;
  dose_info: VaccineDoseInfo;
}

interface ChildData {
  child_id: string;
  firstname: string;
  lastname: string;
  date_of_birth: string;
  age_days: number;
  total_pending_vaccines: number;
  pending_vaccines?: PendingVaccine[];
}

interface ChildVaccinationModalProps {
  child: ChildData | null;
  vaccines: PendingVaccine[];
  isOpen: boolean;
  onClose: () => void;
  onVaccineRecorded?: (childId: string, vaccineId: string, scheduleId: string) => void;
}

const ChildVaccinationModal: React.FC<ChildVaccinationModalProps> = ({
  child,
  vaccines,
  isOpen,
  onClose,
  onVaccineRecorded,
}) => {
  const [selectedVaccine, setSelectedVaccine] = useState<PendingVaccine | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [availableVaccines, setAvailableVaccines] = useState<PendingVaccine[]>([]);

  // Initialize available vaccines when modal opens or vaccines prop changes
  useEffect(() => {
    if (vaccines && vaccines.length > 0) {
      setAvailableVaccines(vaccines);
    }
  }, [vaccines]);

  if (!isOpen || !child || availableVaccines.length === 0) return null;

  // Reset form
  const resetForm = () => {
    setSelectedVaccine(null);
    setSelectedDate("");
    setError("");
    setSuccess("");
  };

  // Handle add record button click
  const handleAddRecordClick = (vaccine: PendingVaccine) => {
    setSelectedVaccine(vaccine);
    setSelectedDate(new Date().toISOString().split("T")[0]); // Set today's date as default
    setIsAddingRecord(true);
    setError("");
    setSuccess("");
  };

  // Handle close add record form
  const handleCloseAddRecord = () => {
    resetForm();
    setIsAddingRecord(false);
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setError("");
  };

  // Submit vaccine record
  const handleSubmitRecord = async () => {
    if (!selectedVaccine || !selectedDate) {
      setError("Please select a date");
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selectedDate)) {
      setError("Invalid date format. Please use YYYY-MM-DD format");
      return;
    }

    // Validate date is not in the future
    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected > today) {
      setError("Date cannot be in the future");
      return;
    }

    // Validate date is after child's birth
    const birthDate = new Date(child.date_of_birth);
    if (selected < birthDate) {
      setError("Date cannot be before child's birth date");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Use postRequest with correct parameter names
      const response = await postRequest("/vaccines/add-record", {
        given_date: selectedDate,
        child_id: child.child_id,
        vaccine_id: selectedVaccine.vaccine_id,
        schedule_id: selectedVaccine.dose_info.schedule_id,
      });

      // Handle response based on your API's return structure
      if (response && (response.status === 200 || response.status === 201)) {
        setSuccess("Vaccine record added successfully!");

        // Remove the recorded vaccine from the local list
        const updatedVaccines = availableVaccines.filter(v => 
          !(v.vaccine_id === selectedVaccine.vaccine_id && 
            v.dose_info.schedule_id === selectedVaccine.dose_info.schedule_id)
        );
        setAvailableVaccines(updatedVaccines);

        // Notify parent component about the recorded vaccine
        if (onVaccineRecorded && child) {
          onVaccineRecorded(
            child.child_id,
            selectedVaccine.vaccine_id,
            selectedVaccine.dose_info.schedule_id
          );
        }

        // Close the form after 2 seconds
        setTimeout(() => {
          resetForm();
          setIsAddingRecord(false);
          
          // If no more vaccines, close the entire modal
          if (updatedVaccines.length === 0) {
            onClose();
          }
        }, 2000);
      } else {
        // Handle other successful status codes
        setSuccess("Vaccine record added successfully!");

        // Remove the recorded vaccine from the local list
        const updatedVaccines = availableVaccines.filter(v => 
          !(v.vaccine_id === selectedVaccine.vaccine_id && 
            v.dose_info.schedule_id === selectedVaccine.dose_info.schedule_id)
        );
        setAvailableVaccines(updatedVaccines);

        // Notify parent component
        if (onVaccineRecorded && child) {
          onVaccineRecorded(
            child.child_id,
            selectedVaccine.vaccine_id,
            selectedVaccine.dose_info.schedule_id
          );
        }

        setTimeout(() => {
          resetForm();
          setIsAddingRecord(false);
          
          if (updatedVaccines.length === 0) {
            onClose();
          }
        }, 2000);
      }
    } catch (err: any) {
      if (err.response) {
        // If err has a response property
        const errorData = err.response.data;
        setError(
          errorData?.detail ||
          errorData?.message ||
          "Failed to add vaccine record"
        );

        // Handle specific error cases
        if (err.response.status === 409) {
          setError("This vaccine record already exists for this child.");
        } else if (err.response.status === 400) {
          setError(
            errorData?.detail ||
            "Invalid request. Please check the date format."
          );
        } else if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response.status === 404) {
          setError("Child or vaccine not found.");
        } else if (err.response.status === 422) {
          setError("Validation error. Please check all fields.");
        }
      } else if (err.message) {
        // If err has a message property
        setError(err.message);
      } else if (typeof err === "string") {
        // If err is a string
        setError(err);
      } else {
        // Default error
        setError(
          "An unexpected error occurred while adding the vaccine record"
        );
      }

      console.error("Error adding vaccine record:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate urgency for a vaccine
  const calculateUrgency = (vaccine: PendingVaccine) => {
    if (!vaccine.dose_info.max_age_days)
      return { isUrgent: false, isOverdue: false, daysUntilDeadline: null };

    const daysUntilDeadline = vaccine.dose_info.max_age_days - child.age_days;
    const isUrgent = daysUntilDeadline <= 7 && daysUntilDeadline > 0;
    const isOverdue = daysUntilDeadline < 0;

    return { isUrgent, isOverdue, daysUntilDeadline };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for display (with full month)
  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate date range
  const calculateDateRange = (minDays: number, maxDays: number | null) => {
    const birthDate = new Date(child.date_of_birth);
    const minDate = new Date(birthDate);
    minDate.setDate(minDate.getDate() + minDays);

    if (!maxDays)
      return {
        minDate: formatDate(minDate.toISOString()),
        maxDate: "No deadline",
      };

    const maxDate = new Date(birthDate);
    maxDate.setDate(maxDate.getDate() + maxDays);

    return {
      minDate: formatDate(minDate.toISOString()),
      maxDate: formatDate(maxDate.toISOString()),
    };
  };

  // Get urgency badge component
  const getUrgencyBadge = (vaccine: PendingVaccine) => {
    const { isUrgent, isOverdue, daysUntilDeadline } = calculateUrgency(vaccine);

    if (isOverdue && daysUntilDeadline !== null) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Overdue by {Math.abs(daysUntilDeadline)} days
        </div>
      );
    }

    if (isUrgent && daysUntilDeadline !== null) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Due in {daysUntilDeadline} days
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
        <Calendar className="w-4 h-4" />
        Within schedule
      </div>
    );
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Calculate remaining vaccines count
  const remainingVaccinesCount = availableVaccines.length;

  return (
    <>
      {/* Full screen backdrop with blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-pulse">
              <Baby className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Viewing {child.firstname}'s vaccines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 mx-2">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isAddingRecord && selectedVaccine
                      ? `Add Record: ${selectedVaccine.vaccine_name}`
                      : `${child.firstname}'s Pending Vaccinations`}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {child.age_days} days old •{" "}
                    {formatDateFull(child.date_of_birth)}
                  </p>
                </div>
              </div>
              <button
                onClick={isAddingRecord ? handleCloseAddRecord : onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {!isAddingRecord && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                  {remainingVaccinesCount} pending vaccine
                  {remainingVaccinesCount !== 1 ? "s" : ""}
                </div>
                <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                  {availableVaccines.filter((v) => v.is_mandatory).length} mandatory
                </div>
              </div>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[calc(90vh-180px)]">
            {isAddingRecord && selectedVaccine ? (
              // Add Record Form
              <div className="space-y-6">
                {/* Vaccine Info Card */}
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {selectedVaccine.vaccine_name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-600">
                          {selectedVaccine.dose_info.dose_name}
                        </span>
                        {selectedVaccine.is_mandatory && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedVaccine.description && (
                    <p className="mt-4 text-gray-600">
                      {selectedVaccine.description}
                    </p>
                  )}
                </div>

                {/* Date Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Date Vaccine Given
                      </div>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={formatDateForInput(child.date_of_birth)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      disabled={isLoading}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Select the date when this vaccine was administered to{" "}
                      {child.firstname}
                    </p>
                  </div>

                  {/* Date Validation Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-800">
                          Date Requirements:
                        </p>
                        <ul className="text-sm text-blue-700 list-disc pl-4 space-y-1">
                          <li>Date must be in YYYY-MM-DD format</li>
                          <li>
                            Date cannot be before child's birth:{" "}
                            {formatDate(child.date_of_birth)}
                          </li>
                          <li>Date cannot be in the future</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-green-700 font-medium">
                            {success}
                          </p>
                          <p className="text-green-600 text-sm mt-1">
                            This form will close automatically...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Original Vaccine List
              <div className="space-y-4 sm:space-y-6">
                {availableVaccines.map((vaccine) => {
                  const { isUrgent, isOverdue, daysUntilDeadline } = calculateUrgency(vaccine);
                  const dateRange = calculateDateRange(
                    vaccine.dose_info.min_age_days,
                    vaccine.dose_info.max_age_days
                  );

                  return (
                    <div
                      key={`${vaccine.vaccine_id}-${vaccine.dose_info.dose_num}`}
                      className={`border rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all duration-200 ${
                        isOverdue
                          ? "border-red-300 bg-red-50 hover:bg-red-100"
                          : isUrgent
                          ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                              vaccine.is_mandatory
                                ? "bg-red-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <Shield
                              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                vaccine.is_mandatory
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                              {vaccine.vaccine_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Syringe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                <span className="text-sm sm:text-base font-medium text-blue-600">
                                  {vaccine.dose_info.dose_name}
                                </span>
                              </div>
                              {vaccine.is_mandatory && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  Mandatory
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="self-start">
                          {getUrgencyBadge(vaccine)}
                        </div>
                      </div>

                      {/* Vaccine details */}
                      <div className="space-y-3 sm:space-y-4">
                        {(vaccine.description || vaccine.protect_against) && (
                          <div className="flex gap-2 sm:gap-3">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm sm:text-base text-gray-700">
                                {vaccine.description ||
                                  `Protects against: ${vaccine.protect_against}`}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Schedule information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">
                                Eligibility:
                              </span>
                              <span className="font-medium text-gray-700 text-right">
                                {vaccine.dose_info.min_age_days} -{" "}
                                {vaccine.dose_info.max_age_days || "No limit"}d
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">
                                Child's age:
                              </span>
                              <span className="font-medium text-gray-700">
                                {child.age_days} days
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">
                                Earliest date:
                              </span>
                              <span className="font-medium text-gray-700 text-right">
                                {dateRange.minDate}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">Deadline:</span>
                              <span
                                className={`font-medium text-right ${
                                  isOverdue
                                    ? "text-red-600"
                                    : isUrgent
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {dateRange.maxDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Days remaining info */}
                        {daysUntilDeadline !== null && (
                          <div
                            className={`px-3 py-2 rounded-lg text-center ${
                              isOverdue
                                ? "bg-red-100 text-red-700"
                                : isUrgent
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            <p className="text-sm font-medium">
                              {isOverdue ? (
                                <>
                                  ⚠️ This vaccine is overdue by{" "}
                                  {Math.abs(daysUntilDeadline)} days
                                </>
                              ) : isUrgent ? (
                                <>⚠️ Schedule within {daysUntilDeadline} days</>
                              ) : (
                                <>
                                  ✓ {daysUntilDeadline} days remaining to
                                  schedule
                                </>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                          <button
                            onClick={() => handleAddRecordClick(vaccine)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md ${
                              isOverdue
                                ? "bg-red-500 hover:bg-red-600"
                                : isUrgent
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-[#e5989b] hover:bg-[#d88a8d]"
                            } text-white`}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm sm:text-base">
                              Record This Vaccine
                            </span>
                          </button>
                          <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base">
                            <Clock className="w-4 h-4 mr-2 inline" />
                            Set Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Conditional buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {isAddingRecord ? (
                <>
                  <button
                    onClick={handleCloseAddRecord}
                    className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRecord}
                    disabled={isLoading}
                    className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center gap-2 ${
                      isLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Record...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Add Vaccine Record
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing {remainingVaccinesCount} vaccine
                    {remainingVaccinesCount !== 1 ? "s" : ""} for {child.firstname}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildVaccinationModal;