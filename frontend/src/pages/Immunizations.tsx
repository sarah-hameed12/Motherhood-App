import { useState, useEffect } from "react";
import { getRequest } from "../api/requests";
import ChildVaccination from "../components/vaccines/ChildVaccination";
import { 
  Syringe, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  X, 
  Info, 
  Shield,
  Baby,
  CheckCircle2
} from "lucide-react";

// Interfaces
import type { ChildMini } from "../interfaces/ChildrenInterfaces";
import type { VaccineUserView } from "../interfaces/VaccinationInterfaces";

const Immunizations = () => {
    const [children, setChildren] = useState<ChildMini[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChild, setExpandedChild] = useState<string | null>(null);

    const [showAllVaccines, setShowAllVaccines] = useState(false);
    const [allVaccines, setAllVaccines] = useState<VaccineUserView[]>([]);
    const [loadingVaccines, setLoadingVaccines] = useState(false);

    console.log(allVaccines);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const response = await getRequest("/user-profile/get-children");
                setChildren(response || []);
                if (response && response.length > 0) {
                    setExpandedChild(response[0].id);
                }
            } catch (error) {
                console.error("Error fetching children:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const fetchAllVaccines = async () => {
        try {
            setLoadingVaccines(true);
            const response = await getRequest("/vaccines/fetch-all");
            setAllVaccines(response || []);
        } catch (error) {
            console.error("Error fetching all vaccines:", error);
        } finally {
            setLoadingVaccines(false);
        }
    };

    const handleOpenAllVaccines = () => {
        setShowAllVaccines(true);
        if (allVaccines.length === 0) {
            fetchAllVaccines();
        }
    };

    const calculateAgeInDays = (birthDate: string) => {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - birth.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const toggleChild = (childId: string) => {
        setExpandedChild(expandedChild === childId ? null : childId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 bg-[#fff6f6]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#e5989b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Loading records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5f7] via-white to-[#f0f9ff] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8 overflow-hidden bg-white rounded-3xl shadow-lg border border-[#e5989b]/20">
                    <div className="h-2 bg-gradient-to-r from-[#e5989b] via-[#d88a8d] to-[#b5838d]"></div>
                    
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl shadow-md">
                                    <Syringe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Immunization Records
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        View vaccines your children have received
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleOpenAllVaccines}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#fceaea] text-[#e5989b] rounded-xl transition-all font-medium border border-[#e5989b]"
                            >
                                <BookOpen className="w-4 h-4" />
                                Vaccine Library
                            </button>
                        </div>

                        {/* Simple Stats */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Baby className="w-4 h-4 text-[#e5989b]" />
                                <span className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{children.length}</span> children
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">
                                    View each child's vaccination history below
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Children List */}
                <div className="space-y-6">
                    {children.length > 0 ? (
                        children.map((child) => {
                            const ageInDays = calculateAgeInDays(child.date_of_birth);
                            const isExpanded = expandedChild === child.id;

                            return (
                                <div
                                    key={child.id}
                                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                                        isExpanded ? 'ring-2 ring-[#e5989b]/20 shadow-lg' : 'hover:shadow-md'
                                    }`}
                                >
                                    <div
                                        onClick={() => toggleChild(child.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50/50 to-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={child.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                    alt={`${child.firstname} ${child.lastname}`}
                                                    className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
                                                />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {child.firstname} {child.lastname}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span className="bg-[#fceaea] text-[#e5989b] px-2 py-0.5 rounded-full text-xs font-semibold">
                                                        {Math.floor(ageInDays / 365)}Y {Math.floor((ageInDays % 365) / 30)}M
                                                    </span>
                                                    <span>•</span>
                                                    <span>DOB: {new Date(child.date_of_birth).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-100">
                                            <div className="p-4 bg-gray-50/30">
                                                <ChildVaccination
                                                    child_id={child.id}
                                                    fullname={`${child.firstname} ${child.lastname}`}
                                                    age={ageInDays}
                                                    onClose={() => toggleChild(child.id)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Syringe className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
                            <p className="text-gray-500">Add a child profile to track immunizations.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Vaccines Modal */}
            {showAllVaccines && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#fff5f7] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-[#e5989b]/20">
                        
                        <div className="px-6 py-4 border-b border-[#e5989b]/10 flex items-center justify-between bg-white/80">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#e5989b] rounded-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Vaccine Library</h2>
                                    <p className="text-xs text-[#e5989b]">Reference guide for all vaccines</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAllVaccines(false)}
                                className="p-2 text-gray-400 hover:text-[#e5989b] hover:bg-[#fceaea] rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-[#fff5f7]">
                            {loadingVaccines ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-10 h-10 border-4 border-[#e5989b] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {allVaccines.map((vaccine) => (
                                        <div 
                                            key={vaccine.vaccine_option_id} 
                                            className="bg-white p-5 rounded-xl border border-[#e5989b]/10"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <h3 className="text-base font-bold text-gray-900">
                                                    {vaccine.vaccine_name}
                                                </h3>
                                                {vaccine.is_mandatory && (
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Mandatory
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {vaccine.vaccine_description}
                                            </p>
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#fceaea] text-[#e5989b] text-xs font-semibold">
                                                <Info className="w-3 h-3 mr-1" />
                                                {vaccine.doses_needed} Dose{vaccine.doses_needed !== 1 ? 's' : ''}
                                            </span>

                                            {vaccine.schedules && vaccine.schedules.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                                                        Schedule
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {vaccine.schedules.map((schedule) => {
                                                            const minDays = (schedule as any).min_days_age || (schedule as any).min_age || 0;
                                                            const maxDays = (schedule as any).max_days_age || (schedule as any).max_age || 0;
                                                            const minMonths = minDays ? Math.floor(minDays / 30) : '?';
                                                            const maxMonths = maxDays ? Math.floor(maxDays / 30) : '?';
                                                            
                                                            return (
                                                                <div 
                                                                    key={schedule.dose_num} 
                                                                    className="flex items-center bg-[#fffafa] rounded-lg border border-[#e5989b]/10 px-3 py-1.5"
                                                                >
                                                                    <span className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-[#e5989b] border border-[#e5989b]/20 mr-2">
                                                                        {schedule.dose_num}
                                                                    </span>
                                                                    <span className="text-xs text-gray-700">
                                                                        {minMonths}-{maxMonths} months
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-[#e5989b]/10 bg-white/50 flex justify-end">
                            <button
                                onClick={() => setShowAllVaccines(false)}
                                className="px-6 py-2 bg-white border border-[#e5989b] text-[#e5989b] font-medium rounded-lg hover:bg-[#e5989b] hover:text-white transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Immunizations;