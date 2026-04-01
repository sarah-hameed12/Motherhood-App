import { useState, useEffect } from "react";
import {
  Syringe,
  CalendarDays,
  Clock,
  Baby,
  ChevronRight,
  User,
  AlertCircle,
  Shield,
  Plus,
  AlertTriangle,
  CheckSquare,
  Clock3,
  TrendingUp,
  Stethoscope,
  HeartPulse,
  Eye,
  Pill
} from "lucide-react";
import VaccineDetailPopup from "./VaccineDetailPopup";

interface Schedule {
  id: string;
  dose_num: number;
  min_age_days: number;
  max_age_days: number;
  vaccine_id: string;
}

interface Vaccine {
  vaccine_id: string;
  vaccine_name: string;
  description: string;
  protect_against: string;
  doses_needed: number;
  is_mandatory: boolean;
  total_schedules: number;
  schedules: Schedule[];
}

interface VaccineRecord {
  id?: string;
  vaccine_id: string;
  dose_num: number;
  status: "PENDING" | "GIVEN" | "MISSED";
  date_given?: string;
  child_id?: string;
}

interface ChildVaccinationCardProps {
  child: any;
  vaccinesData: {
    total_vaccines: number;
    vaccines: Vaccine[];
  };
  existingVaccinations: VaccineRecord[];
  reminders: any[];
  editingId: string | null;
  editForm: { date_given: string; status: string };
  onEditStart: (vaccine: VaccineRecord) => void;
  onEditCancel: () => void;
  onEditSave: (recordId: string) => void;
  onEditFormChange: (form: { date_given: string; status: string }) => void;
  onDelete: (recordId: string, vaccineName: string) => void;
  onReminderCreate: (vaccine: any) => void;
  onReminderDelete: (vaccineId: string, childId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (childId: string) => void;
  onAddRecord: (childId: string, vaccineId: string, doseNum: number) => void;
}

const ChildVaccinationCard = ({
  child,
  vaccinesData,
  existingVaccinations,
  reminders,
  editingId,
  editForm,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditFormChange,
  onDelete,
  onReminderCreate,
  onReminderDelete,
  isExpanded,
  onToggleExpand,
  onAddRecord
}: ChildVaccinationCardProps) => {
  const [childAgeInDays, setChildAgeInDays] = useState<number>(0);
  const [vaccinationStatuses, setVaccinationStatuses] = useState<{
    [key: string]: { status: "PENDING" | "NOT_GIVEN" | "GIVEN" | "MISSED"; doseNum: number }[]
  }>({});
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [showOptionalVaccines, setShowOptionalVaccines] = useState(false);

  // Calculate child's age in days
  useEffect(() => {
    if (child.date_of_birth) {
      const birthDate = new Date(child.date_of_birth);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - birthDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setChildAgeInDays(diffDays);
    }
  }, [child.date_of_birth]);

  // Calculate vaccination status for each vaccine
  useEffect(() => {
    if (!vaccinesData?.vaccines) return;

    const statuses: { [key: string]: { status: "PENDING" | "NOT_GIVEN" | "GIVEN" | "MISSED"; doseNum: number }[] } = {};

    vaccinesData.vaccines.forEach(vaccine => {
      const vaccineRecords = existingVaccinations.filter(v => v.vaccine_id === vaccine.vaccine_id);
      const doseStatuses: { status: "PENDING" | "NOT_GIVEN" | "GIVEN" | "MISSED"; doseNum: number }[] = [];

      // Check each dose schedule
      for (let doseNum = 1; doseNum <= vaccine.doses_needed; doseNum++) {
        const schedule = vaccine.schedules.find(s => s.dose_num === doseNum);
        const existingRecord = vaccineRecords.find(v => v.dose_num === doseNum);

        if (existingRecord) {
          // If there's an existing record, use its status
          doseStatuses.push({
            status: existingRecord.status,
            doseNum
          });
        } else if (schedule && childAgeInDays && childAgeInDays >= schedule.min_age_days && childAgeInDays <= schedule.max_age_days) {
          // If child is within the age range for this dose
          doseStatuses.push({
            status: "PENDING",
            doseNum
          });
        } else {
          // If child is not in the age range and no record exists
          const status = schedule && childAgeInDays && childAgeInDays > schedule.max_age_days ? "MISSED" : "NOT_GIVEN";
          doseStatuses.push({
            status,
            doseNum
          });
        }
      }

      statuses[vaccine.vaccine_id] = doseStatuses;
    });

    setVaccinationStatuses(statuses);
  }, [vaccinesData, childAgeInDays, existingVaccinations]);

  // Separate vaccines by mandatory status and sort by pending status
  const mandatoryVaccines = vaccinesData?.vaccines
    ?.filter(v => v.is_mandatory)
    .sort((a, b) => {
      const aPending = vaccinationStatuses[a.vaccine_id]?.filter(s => s.status === "PENDING").length || 0;
      const bPending = vaccinationStatuses[b.vaccine_id]?.filter(s => s.status === "PENDING").length || 0;
      return bPending - aPending;
    }) || [];

  const optionalVaccines = vaccinesData?.vaccines
    ?.filter(v => !v.is_mandatory)
    .sort((a, b) => {
      const aPending = vaccinationStatuses[a.vaccine_id]?.filter(s => s.status === "PENDING").length || 0;
      const bPending = vaccinationStatuses[b.vaccine_id]?.filter(s => s.status === "PENDING").length || 0;
      return bPending - aPending;
    }) || [];

 

  // Calculate child stats
  const getChildStats = () => {
    const allVaccineStatuses = Object.values(vaccinationStatuses).flat();
    const total = allVaccineStatuses.length;
    const given = allVaccineStatuses.filter(v => v.status === "GIVEN").length;
    const pending = allVaccineStatuses.filter(v => v.status === "PENDING").length;
    const missed = allVaccineStatuses.filter(v => v.status === "MISSED").length;
    const coverage = total > 0 ? Math.round((given / total) * 100) : 0;
    
    return { total, given, pending, missed, coverage };
  };

  const stats = getChildStats();

  // Progress bar for child stats
  const ProgressBar = ({ title, value, max, color }: { title: string; value: number; max: number; color: string }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="text-sm font-semibold text-gray-900">{value}/{max}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">{percentage}% complete</div>
      </div>
    );
  };

  // Vaccine Card Component
  const VaccineCard = ({ vaccine }: { vaccine: Vaccine }) => {
    const doseStatuses = vaccinationStatuses[vaccine.vaccine_id] || [];
    const pendingDoses = doseStatuses.filter(s => s.status === "PENDING").length;
    const givenDoses = doseStatuses.filter(s => s.status === "GIVEN").length;
    const missedDoses = doseStatuses.filter(s => s.status === "MISSED").length;

    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        onClick={() => setSelectedVaccine(vaccine)}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${vaccine.is_mandatory ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 group-hover:text-[#e5989b] transition-colors">
                  {vaccine.vaccine_name}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{vaccine.doses_needed} doses</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vaccine.is_mandatory 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {vaccine.is_mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>
            <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#e5989b] transition-colors" />
          </div>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{vaccine.description}</p>
          
          <div className="space-y-3">
            {/* Status Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {givenDoses > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">{givenDoses} given</span>
                  </div>
                )}
                {pendingDoses > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">{pendingDoses} pending</span>
                  </div>
                )}
                {missedDoses > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">{missedDoses} missed</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs font-medium text-gray-700">
                {Math.round((givenDoses / vaccine.doses_needed) * 100)}% complete
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ 
                  width: `${(givenDoses / vaccine.doses_needed) * 100}%`,
                  background: `linear-gradient(90deg, 
                    #10b981 ${(givenDoses / vaccine.doses_needed) * 100}%, 
                    #f59e0b ${(givenDoses / vaccine.doses_needed) * 100}% ${((givenDoses + pendingDoses) / vaccine.doses_needed) * 100}%, 
                    #ef4444 ${((givenDoses + pendingDoses) / vaccine.doses_needed) * 100}%)`
                }}
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <HeartPulse className="w-3 h-3" />
                <span className="truncate">{vaccine.protect_against.split(',')[0].trim()}</span>
              </div>
              {pendingDoses > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const firstPending = doseStatuses.find(s => s.status === "PENDING");
                    if (firstPending) {
                      onAddRecord(child.id, vaccine.vaccine_id, firstPending.doseNum);
                    }
                  }}
                  className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Record
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vaccine Group Component
  const VaccineGroup = ({ 
    title, 
    vaccines, 
    icon: Icon,
    isMandatory = true
  }: { 
    title: string; 
    vaccines: Vaccine[]; 
    icon: any;
    isMandatory?: boolean;
  }) => {
    if (vaccines.length === 0) return null;

    // Count pending vaccines in this group
    const pendingCount = vaccines.reduce((count, vaccine) => {
      const statuses = vaccinationStatuses[vaccine.vaccine_id] || [];
      return count + statuses.filter(s => s.status === "PENDING").length;
    }, 0);

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isMandatory ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {vaccines.length} vaccine{vaccines.length !== 1 ? 's' : ''}
                </span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {pendingCount} pending dose{pendingCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={() => setShowOptionalVaccines(!showOptionalVaccines)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {showOptionalVaccines ? 'Hide' : 'Show'} ({optionalVaccines.length})
            </button>
          )}
        </div>
        
        {(isMandatory || showOptionalVaccines) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map(vaccine => (
              <VaccineCard key={vaccine.vaccine_id} vaccine={vaccine} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 hover:shadow-md transition-shadow">
        {/* Child Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onToggleExpand(child.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                stats.pending > 0 
                  ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300' 
                  : 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300'
              }`}>
                <Baby className={`w-7 h-7 ${stats.pending > 0 ? 'text-yellow-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {child.firstname} {child.lastname}
                  {stats.pending > 0 && (
                    <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {stats.pending} pending
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="w-4 h-4" />
                    {child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString() : "No DOB"}
                    {childAgeInDays > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                        {childAgeInDays} days old
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    {child.gender || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.given}</div>
                  <div className="text-xs text-gray-500">Given</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.coverage}%</div>
                  <div className="text-xs text-gray-500">Coverage</div>
                </div>
              </div>
              
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-6">
            {/* Summary Stats with Progress Bars */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h5 className="font-medium text-gray-900">Overall Progress</h5>
                  </div>
                  <ProgressBar 
                    title="Given Doses" 
                    value={stats.given} 
                    max={stats.total} 
                    color="bg-green-500" 
                  />
                  <ProgressBar 
                    title="Pending Doses" 
                    value={stats.pending} 
                    max={stats.total} 
                    color="bg-yellow-500" 
                  />
                  <ProgressBar 
                    title="Missed Doses" 
                    value={stats.missed} 
                    max={stats.total} 
                    color="bg-red-500" 
                  />
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h5 className="font-medium text-gray-900">Quick Stats</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-2xl font-bold text-green-600">{stats.given}</div>
                      <div className="text-sm font-medium text-green-700">Given</div>
                      <CheckSquare className="w-4 h-4 text-green-400 mx-auto mt-2" />
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                      <div className="text-sm font-medium text-yellow-700">Pending</div>
                      <Clock3 className="w-4 h-4 text-yellow-400 mx-auto mt-2" />
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
                      <div className="text-sm font-medium text-red-700">Missed</div>
                      <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mt-2" />
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{stats.coverage}%</div>
                      <div className="text-sm font-medium text-blue-700">Coverage</div>
                      <Stethoscope className="w-4 h-4 text-blue-400 mx-auto mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Vaccines */}
            <VaccineGroup 
              title="Mandatory Vaccines" 
              vaccines={mandatoryVaccines} 
              icon={Shield}
              isMandatory={true}
            />

            {/* Optional Vaccines */}
            <VaccineGroup 
              title="Optional Vaccines" 
              vaccines={optionalVaccines} 
              icon={Syringe}
              isMandatory={false}
            />

            {mandatoryVaccines.length === 0 && optionalVaccines.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No vaccine schedules available</p>
                <p className="text-gray-400 text-sm mt-1">Vaccination schedules will be loaded soon</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vaccine Detail Popup */}
      {selectedVaccine && (
        <VaccineDetailPopup
          isOpen={!!selectedVaccine}
          onClose={() => setSelectedVaccine(null)}
          vaccine={selectedVaccine}
          child={child}
          childAgeInDays={childAgeInDays}
          existingVaccinations={existingVaccinations}
          reminders={reminders}
          editingId={editingId}
          editForm={editForm}
          onEditStart={onEditStart}
          onEditCancel={onEditCancel}
          onEditSave={onEditSave}
          onEditFormChange={onEditFormChange}
          onDelete={onDelete}
          onReminderCreate={onReminderCreate}
          onReminderDelete={onReminderDelete}
          onAddRecord={onAddRecord}
        />
      )}
    </>
  );
};

export default ChildVaccinationCard;