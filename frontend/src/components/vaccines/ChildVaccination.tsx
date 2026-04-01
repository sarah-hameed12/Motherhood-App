import { useEffect, useState, useCallback } from "react";
import { postRequest, getRequest } from "../../api/requests";
import { Shield, CheckCircle, ChevronDown, ChevronUp} from "lucide-react";

const ChildVaccination = ({ child_id, age, }: any) => {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null);
  const [recordingDates, setRecordingDates] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Get required list
      const reqs = await postRequest(`/vaccines/required-vaccines/${child_id}`, { child_age: age });
      
      // 2. Get history
      const report = await getRequest(`/vaccines/child/${child_id}/medical-report`);
      const history = report?.vaccination_history || [];
      const doneIds = history.map((h: any) => String(h.vaccine_id));

      // 3. Filter out completed ones
      const pending = (reqs || []).filter((v: any) => !doneIds.includes(String(v.vaccine_id)));
      setVaccinations(pending);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [child_id, age]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (v: any) => {
  const date = recordingDates[v.vaccine_id];
  if (!date) return alert("Select a date!");

  try {
    setIsSaving(prev => ({ ...prev, [v.vaccine_id]: true }));
    
    // THE FIX: Include all 4 fields required by your VaccineRecordRequest schema
    await postRequest(`/vaccines/create-record/${child_id}`, {
      given_date: date,        // Matches 'given_date: str' in schema
      child_id: child_id,      // Matches 'child_id: UUID' in schema (MISSING BEFORE)
      vaccine_id: v.vaccine_id, // Matches 'vaccine_id: UUID' in schema
      schedule_id: v.schedule_id // Matches 'schedule_id: UUID' in schema
    });
    
    alert("Vaccination logged successfully! ✨");
    setRecordingDates(prev => ({ ...prev, [v.vaccine_id]: "" }));
    await loadData(); // Refresh the list to hide the completed vaccine
  } catch (err: any) {
    console.error("422 Details:", err.response?.data?.detail);
    alert("Failed to save. Check if all data is valid.");
  } finally {
    setIsSaving(prev => ({ ...prev, [v.vaccine_id]: false }));
  }
};

  if (loading && vaccinations.length === 0) return <div className="p-10 text-center">Syncing...</div>;

  return (
    <div className="p-4 space-y-4">
      {vaccinations.length === 0 ? (
        <div className="text-center py-10">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="font-bold">No pending vaccines!</p>
        </div>
      ) : (
        vaccinations.map((v) => {
          const uniqueKey = `${v.vaccine_id}-${v.dose_num}`;
          const isOpen = expandedVaccine === uniqueKey;

          return (
            <div key={uniqueKey} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div 
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => setExpandedVaccine(isOpen ? null : uniqueKey)}
              >
                <div className="flex items-center gap-3">
                  <Shield className="text-[#e5989b]" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">{v.vaccine_name}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Dose {v.dose_num}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </div>

              {isOpen && (
                <div className="p-4 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-xs text-gray-600">{v.description}</p>
                  <div className="bg-white p-3 rounded-lg border">
                    <input 
                      type="date" 
                      className="w-full p-2 text-xs border rounded mb-2"
                      value={recordingDates[v.vaccine_id] || ""}
                      onChange={(e) => setRecordingDates(prev => ({...prev, [v.vaccine_id]: e.target.value}))}
                    />
                    <button 
                      onClick={() => handleSave(v)}
                      disabled={isSaving[v.vaccine_id] || !recordingDates[v.vaccine_id]}
                      className="w-full bg-[#e5989b] text-white py-2 rounded-lg text-[10px] font-bold uppercase"
                    >
                      {isSaving[v.vaccine_id] ? "Saving..." : "Log Dose"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChildVaccination;