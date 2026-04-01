import {
  Syringe,
  Calendar,
  CheckCircle,
  Clock,
  Baby,
  Trash2,
  Edit2,
  X,
  Save,
  Bell,
  BellOff,
  AlertCircle,
  Shield,
  Plus,
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  Pill,
  CalendarDays,
  FileText
} from "lucide-react";

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

interface VaccineDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  vaccine: Vaccine;
  child: any;
  childAgeInDays: number;
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
  onAddRecord: (childId: string, vaccineId: string, doseNum: number) => void;
}

const VaccineDetailPopup = ({
  isOpen,
  onClose,
  vaccine,
  child,
  childAgeInDays,
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
  onAddRecord
}: VaccineDetailPopupProps) => {
  if (!isOpen) return null;

  // Calculate vaccination statuses for this vaccine
  const getVaccineStatuses = () => {
    const vaccineRecords = existingVaccinations.filter(v => v.vaccine_id === vaccine.vaccine_id);
    const doseStatuses: { status: "PENDING" | "NOT_GIVEN" | "GIVEN" | "MISSED"; doseNum: number }[] = [];

    for (let doseNum = 1; doseNum <= vaccine.doses_needed; doseNum++) {
      const schedule = vaccine.schedules.find(s => s.dose_num === doseNum);
      const existingRecord = vaccineRecords.find(v => v.dose_num === doseNum);

      if (existingRecord) {
        doseStatuses.push({
          status: existingRecord.status,
          doseNum
        });
      } else if (schedule && childAgeInDays && childAgeInDays >= schedule.min_age_days && childAgeInDays <= schedule.max_age_days) {
        doseStatuses.push({
          status: "PENDING",
          doseNum
        });
      } else {
        const status = schedule && childAgeInDays && childAgeInDays > schedule.max_age_days ? "MISSED" : "NOT_GIVEN";
        doseStatuses.push({
          status,
          doseNum
        });
      }
    }

    return doseStatuses;
  };

  const doseStatuses = getVaccineStatuses();
  const pendingDoses = doseStatuses.filter(s => s.status === "PENDING").length;
  const givenDoses = doseStatuses.filter(s => s.status === "GIVEN").length;
  const missedDoses = doseStatuses.filter(s => s.status === "MISSED").length;

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "GIVEN": return "bg-green-50 text-green-700 border-green-200";
      case "MISSED": return "bg-red-50 text-red-700 border-red-200";
      case "NOT_GIVEN": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "PENDING": return Clock;
      case "GIVEN": return CheckCircle;
      case "MISSED": return AlertCircle;
      case "NOT_GIVEN": return ShieldAlert;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "GIVEN": return "Given";
      case "PENDING": return "Pending";
      case "MISSED": return "Missed";
      case "NOT_GIVEN": return "Not Given";
      default: return status;
    }
  };

  const hasReminder = (vaccineId: string, childId: string) => {
    return reminders.some(reminder => 
      reminder.vaccine_id === vaccineId && reminder.child_id === childId
    );
  };

  // Vaccine Dose Component
  const VaccineDoseItem = ({ 
    doseStatus 
  }: { 
    doseStatus: { status: "PENDING" | "NOT_GIVEN" | "GIVEN" | "MISSED"; doseNum: number } 
  }) => {
    const isEditing = editingId === `${vaccine.vaccine_id}-${doseStatus.doseNum}`;
    const isPending = doseStatus.status === "PENDING";
    const isGiven = doseStatus.status === "GIVEN";
    const hasExistingReminder = hasReminder(vaccine.vaccine_id, child.id);
    const StatusIcon = getStatusIcon(doseStatus.status);
    const existingRecord = existingVaccinations.find(
      v => v.vaccine_id === vaccine.vaccine_id && v.dose_num === doseStatus.doseNum
    );
    const schedule = vaccine.schedules.find(s => s.dose_num === doseStatus.doseNum);

    return (
      <div className={`rounded-lg p-4 border ${getStatusColor(doseStatus.status).replace('bg-', 'border-').split(' ')[1]}`}>
        {isEditing && existingRecord ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Syringe className="w-4 h-4 text-[#e5989b]" />
              <h5 className="font-medium text-gray-900">
                Dose {doseStatus.doseNum}
              </h5>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Date Given</label>
              <input
                type="date"
                value={editForm.date_given}
                onChange={(e) => onEditFormChange({ ...editForm, date_given: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => onEditFormChange({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="GIVEN">Given</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>
            
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onEditSave(existingRecord.id!)}
                className="flex-1 flex items-center justify-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={onEditCancel}
                className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Syringe className="w-4 h-4 text-[#e5989b]" />
                  <h5 className="font-medium text-gray-900">
                    Dose {doseStatus.doseNum}
                  </h5>
                </div>
                {schedule && (
                  <div className="text-xs text-gray-500 ml-6">
                    Recommended: {schedule.min_age_days}-{schedule.max_age_days} days
                    {childAgeInDays && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                        childAgeInDays >= schedule.min_age_days && childAgeInDays <= schedule.max_age_days 
                          ? 'bg-yellow-100 text-yellow-800'
                          : childAgeInDays > schedule.max_age_days
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {childAgeInDays >= schedule.min_age_days && childAgeInDays <= schedule.max_age_days 
                          ? 'Due Now'
                          : childAgeInDays > schedule.max_age_days
                          ? 'Overdue'
                          : 'Upcoming'
                        }
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doseStatus.status)}`}>
                <StatusIcon className="w-3 h-3" />
                {getStatusLabel(doseStatus.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>
                  {existingRecord?.date_given 
                    ? `Given on: ${new Date(existingRecord.date_given).toLocaleDateString()}`
                    : schedule
                      ? `Age window: ${schedule.min_age_days}-${schedule.max_age_days} days`
                      : 'Schedule not specified'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {/* Add Record Button - Show for pending doses */}
                {isPending && (
                  <button
                    onClick={() => onAddRecord(child.id, vaccine.vaccine_id, doseStatus.doseNum)}
                    className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Add Record
                  </button>
                )}
                
                {/* Edit Button - Show for existing records */}
                {existingRecord && (
                  <button
                    onClick={() => onEditStart(existingRecord)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit vaccination record"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Reminder Button - Show for pending and given vaccines */}
                {(isPending || isGiven) && (
                  <button
                    onClick={() => hasExistingReminder 
                      ? onReminderDelete(vaccine.vaccine_id, child.id)
                      : onReminderCreate({
                          vaccine_id: vaccine.vaccine_id,
                          child_id: child.id,
                          dose_num: doseStatus.doseNum,
                          vaccineName: vaccine.vaccine_name,
                          childName: `${child.firstname} ${child.lastname}`
                        })
                    }
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasExistingReminder 
                        ? "text-green-500 hover:bg-green-50" 
                        : "text-orange-500 hover:bg-orange-50"
                    }`}
                    title={hasExistingReminder ? "Remove reminder" : "Set reminder"}
                  >
                    {hasExistingReminder ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                  </button>
                )}
                
                {/* Delete Button - Show for existing records */}
                {existingRecord && (
                  <button
                    onClick={() => onDelete(existingRecord.id!, `${vaccine.vaccine_name} - Dose ${doseStatus.doseNum}`)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete vaccination record"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Popup Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${vaccine.is_mandatory ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{vaccine.vaccine_name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Baby className="w-4 h-4" />
                    <span>{child.firstname} {child.lastname}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    <span>{childAgeInDays} days old</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Vaccine Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{vaccine.doses_needed} dose{vaccine.doses_needed !== 1 ? 's' : ''} needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {vaccine.is_mandatory ? 'Mandatory' : 'Optional'} Vaccine
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Protects against: {vaccine.protect_against}</span>
            </div>
          </div>
        </div>

        {/* Popup Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {vaccine.description}
            </p>
          </div>

          {/* Stats Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{givenDoses}</div>
                <div className="text-sm font-medium text-green-700">Given</div>
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-2" />
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{pendingDoses}</div>
                <div className="text-sm font-medium text-yellow-700">Pending</div>
                <Clock className="w-5 h-5 text-yellow-400 mx-auto mt-2" />
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-2xl font-bold text-red-600">{missedDoses}</div>
                <div className="text-sm font-medium text-red-700">Missed</div>
                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mt-2" />
              </div>
            </div>
          </div>

          {/* Doses Details */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Dose Details</h3>
              <div className="text-sm text-gray-500">
                Total: {vaccine.doses_needed} • Given: {givenDoses} • Pending: {pendingDoses}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doseStatuses.map((doseStatus) => (
                <VaccineDoseItem 
                  key={`${vaccine.vaccine_id}-${doseStatus.doseNum}`}
                  doseStatus={doseStatus}
                />
              ))}
            </div>
          </div>

          {/* Schedules Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Schedule</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dose</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Age Window</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccine.schedules.map((schedule) => {
                      const doseStatus = doseStatuses.find(s => s.doseNum === schedule.dose_num);
                      const StatusIcon = doseStatus ? getStatusIcon(doseStatus.status) : ShieldAlert;
                      
                      return (
                        <tr key={schedule.id} className="border-b border-gray-200 last:border-0">
                          <td className="py-3 px-4 text-sm text-gray-900">Dose {schedule.dose_num}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {schedule.min_age_days}-{schedule.max_age_days} days
                          </td>
                          <td className="py-3 px-4">
                            {doseStatus && (
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doseStatus.status)}`}>
                                <StatusIcon className="w-3 h-3" />
                                {getStatusLabel(doseStatus.status)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Popup Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Coverage:</span> {Math.round((givenDoses / vaccine.doses_needed) * 100)}%
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Close
              </button>
              {pendingDoses > 0 && (
                <button
                  onClick={() => {
                    const firstPending = doseStatuses.find(s => s.status === "PENDING");
                    if (firstPending) {
                      onAddRecord(child.id, vaccine.vaccine_id, firstPending.doseNum);
                    }
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[#e5989b] text-white hover:bg-[#d88a8d] rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineDetailPopup;