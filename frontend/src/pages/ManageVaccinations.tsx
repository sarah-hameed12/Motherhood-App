import { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Syringe, 
  Loader2, 
  AlertCircle,
  Shield,
  Trash2,
  Edit2,
  ChevronDown,
  Check
} from "lucide-react";
import { getRequest, postRequest } from "../api/requests";

interface Schedule {
  dose_num: number;
  min_days_age: number;
  max_days_age: number;
}

interface Vaccine {
  vaccine_option_id: string;
  vaccine_name: string;
  vaccine_description: string;
  doses_needed: number;
  is_mandatory: boolean;
  schedules: Schedule[];
}

const ManageVaccinations = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedVaccines, setExpandedVaccines] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    vaccine_name: "",
    description: "",
    protect_against: "",
    doses_needed: 1,
    is_mandatory: false,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch vaccines on component mount
  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getRequest("/vaccines/fetch-all");
      setVaccines(data || []);
    } catch (err) {
      console.error("Error fetching vaccines:", err);
      setError("Failed to load vaccines. Please try again.");
      setVaccines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.vaccine_name.trim()) {
      setFormError("Vaccine name is required");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (!formData.protect_against.trim()) {
      setFormError("'Protects Against' is required");
      return;
    }
    if (formData.doses_needed < 1) {
      setFormError("Doses needed must be at least 1");
      return;
    }

    setFormLoading(true);
    try {
      await postRequest("/vaccines/create-vaccine-option", {
        vaccine_name: formData.vaccine_name,
        description: formData.description,
        protect_against: formData.protect_against,
        doses_needed: parseInt(formData.doses_needed.toString()),
        is_mandatory: formData.is_mandatory,
      });

      setSuccessMessage("Vaccine added successfully!");
      setFormData({
        vaccine_name: "",
        description: "",
        protect_against: "",
        doses_needed: 1,
        is_mandatory: false,
      });
      setIsModalOpen(false);

      // Refetch vaccines
      setTimeout(() => {
        fetchVaccines();
        setSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      console.error("Error adding vaccine:", err);
      setFormError(err.message || "Failed to add vaccine. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleVaccineExpand = (vaccineId: string) => {
    setExpandedVaccines((prev) =>
      prev.includes(vaccineId)
        ? prev.filter((id) => id !== vaccineId)
        : [...prev, vaccineId]
    );
  };

  const formatAgeRange = (minDays: number, maxDays: number) => {
    const minMonths = Math.floor(minDays / 30);
    const maxMonths = Math.floor(maxDays / 30);
    if (minMonths === maxMonths) {
      return `${minMonths} month${minMonths !== 1 ? "s" : ""}`;
    }
    return `${minMonths}-${maxMonths} months`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center shadow-lg">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Manage Vaccinations</h1>
            </div>
            <p className="text-gray-600">Create and manage vaccine options for the platform</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Vaccine</span>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Vaccines List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
              <Loader2 className="w-8 h-8 text-[#e5989b] animate-spin mb-3" />
              <p className="text-gray-600 font-medium">Loading vaccines...</p>
            </div>
          ) : vaccines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Syringe className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No vaccines yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first vaccine</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#fceaea] text-[#e5989b] rounded-lg hover:bg-[#f8d8d8] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Vaccine
              </button>
            </div>
          ) : (
            vaccines.map((vaccine) => (
              <div
                key={vaccine.vaccine_option_id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Vaccine Header */}
                <div
                  onClick={() => toggleVaccineExpand(vaccine.vaccine_option_id)}
                  className="cursor-pointer p-4 sm:p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fceaea] to-[#f8d8d8] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-6 h-6 text-[#e5989b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{vaccine.vaccine_name}</h3>
                        {vaccine.is_mandatory && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{vaccine.vaccine_description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Protects against: {"Not specified"}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          {vaccine.doses_needed} dose{vaccine.doses_needed !== 1 ? "s" : ""} needed
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      expandedVaccines.includes(vaccine.vaccine_option_id) ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Vaccine Details - Expanded */}
                {expandedVaccines.includes(vaccine.vaccine_option_id) && (
                  <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Dosing Schedule</h4>

                    {vaccine.schedules && vaccine.schedules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vaccine.schedules.map((schedule, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-[#e5989b] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {schedule.dose_num}
                              </div>
                              <span className="font-semibold text-gray-900">
                                Dose {schedule.dose_num}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Age: {formatAgeRange(schedule.min_days_age, schedule.max_days_age)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {schedule.min_days_age} - {schedule.max_days_age} days
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No dosing schedule defined yet</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                      <button className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Vaccine Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop - blurs entire screen including header */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60]"
            onClick={() => !formLoading && setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white via-[#fff6f6] to-[#fceaea] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5989b]/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#e5989b]/20 sticky top-0 bg-gradient-to-r from-[#fff6f6] to-[#fceaea]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-lg flex items-center justify-center">
                    <Syringe className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Vaccine</h2>
                </div>
                <button
                  onClick={() => !formLoading && setIsModalOpen(false)}
                  className="p-2 hover:bg-[#fceaea] rounded-lg transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  <X className="w-6 h-6 text-[#e5989b]" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddVaccine} className="p-6 space-y-5">
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 font-medium">{formError}</p>
                  </div>
                )}

                {/* Vaccine Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Vaccine Name *
                  </label>
                  <input
                    type="text"
                    name="vaccine_name"
                    value={formData.vaccine_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Measles, Mumps & Rubella (MMR)"
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none transition-all placeholder:text-gray-500"
                    disabled={formLoading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the vaccine and what it does..."
                    rows={3}
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none transition-all resize-none placeholder:text-gray-500"
                    disabled={formLoading}
                  />
                </div>

                {/* Protects Against */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Protects Against *
                  </label>
                  <input
                    type="text"
                    name="protect_against"
                    value={formData.protect_against}
                    onChange={handleInputChange}
                    placeholder="e.g., Measles, Mumps, Rubella"
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none transition-all placeholder:text-gray-500"
                    disabled={formLoading}
                  />
                </div>

                {/* Doses Needed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Doses Needed *
                  </label>
                  <input
                    type="number"
                    name="doses_needed"
                    value={formData.doses_needed}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none transition-all"
                    disabled={formLoading}
                  />
                </div>

                {/* Mandatory Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#fceaea] to-[#f8d8d8] rounded-xl border border-[#e5989b]/20">
                  <input
                    type="checkbox"
                    id="is_mandatory"
                    name="is_mandatory"
                    checked={formData.is_mandatory}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#e5989b] rounded cursor-pointer accent-[#e5989b]"
                    disabled={formLoading}
                  />
                  <label htmlFor="is_mandatory" className="flex-1 cursor-pointer">
                    <p className="font-semibold text-gray-900">Mark as Mandatory</p>
                    <p className="text-sm text-gray-700">Parents must complete this vaccine for their children</p>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#e5989b]/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-[#e5989b]/30 text-[#e5989b] rounded-lg hover:bg-[#fceaea] transition-colors font-semibold disabled:opacity-50"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Vaccine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageVaccinations;