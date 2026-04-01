import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Baby, Syringe } from "lucide-react";
import { getRequest, postRequest } from "../api/requests";

const AddVaccination = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<any[]>([]);
  const [vaccineOptions, setVaccineOptions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    childId: "",
    vaccineId: "",
    scheduleId: "",
    doseNum: "",
    dateGiven: "",
    status: "Pending",
  });

  // Fetch children and vaccine options when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [childrenData, vaccineOptionsData] = await Promise.all([
          getRequest("/user-profile/get-children"),
          getRequest("/vaccination-options/all")
        ]);
        
        setChildren(childrenData || []);
        setVaccineOptions(vaccineOptionsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(vaccineOptions);

  // Fetch schedules when vaccine is selected
  useEffect(() => {
    const fetchSchedules = async () => {
      if (form.vaccineId) {
        try {
          const schedulesData = await getRequest(`/vaccination-schedule/vaccine/${form.vaccineId}`);
          setSchedules(schedulesData || []);
          
          // Reset schedule and dose if vaccine changes
          setForm(prev => ({ ...prev, scheduleId: "", doseNum: "" }));
        } catch (error) {
          console.error("Error fetching schedules:", error);
          setSchedules([]);
        }
      } else {
        setSchedules([]);
      }
    };

    fetchSchedules();
  }, [form.vaccineId]);

  // Auto-select schedule when dose number is selected
  useEffect(() => {
    if (form.vaccineId && form.doseNum && schedules.length > 0) {
      const matchingSchedule = schedules.find(
        s => s.vaccine_id === form.vaccineId && s.dose_num === parseInt(form.doseNum)
      );
      if (matchingSchedule) {
        setForm(prev => ({ ...prev, scheduleId: matchingSchedule.id }));
      }
    }
  }, [form.doseNum, form.vaccineId, schedules]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    try {
      // Prepare data according to API schema
      const vaccinationData = {
        child_id: form.childId,
        vaccine_id: form.vaccineId,
        schedule_id: form.scheduleId,
        dose_num: parseInt(form.doseNum) || 0,
        date_given: form.dateGiven,
        status: form.status.toUpperCase(),
      };

      console.log("Sending data:", JSON.stringify(vaccinationData, null, 2));

      // Call the POST API
      const response = await postRequest("/vaccination-records/create", vaccinationData);
      console.log("Response:", response);

      // Navigate back to vaccinations page
      navigate("/vaccinations");

    } catch (error: any) {
      console.error("Error saving vaccination:", error);
      console.error("Error response:", error.response?.data);
      
      // Handle error message
      const errorDetail = error.response?.data?.detail;
      if (typeof errorDetail === 'string') {
        alert(`Failed to save vaccination: ${errorDetail}`);
      } else if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map((err: any) => 
          `${err.loc?.join(' -> ')}: ${err.msg}`
        ).join('\n');
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert(`Failed to save vaccination: ${error.message}`);
      }
    }
  };

  const getAvailableDoses = () => {
    if (!form.vaccineId || schedules.length === 0) return [];
    
    // Get unique dose numbers for the selected vaccine
    const doses = schedules
      .filter(s => s.vaccine_id === form.vaccineId)
      .map(s => s.dose_num)
      .sort((a, b) => a - b);
    
    return [...new Set(doses)];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Add New Vaccination
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Child Selection */}
          <div>
            <label className="font-medium text-gray-700">Select Child *</label>
            <div className="flex items-center mt-2 bg-gray-100 rounded-xl px-4">
              <Baby className="w-5 h-5 text-gray-500 mr-2" />
              <select
                name="childId"
                onChange={handleChange}
                value={form.childId}
                className="w-full py-3 bg-transparent outline-none"
                required
              >
                <option value="">Select a child</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstname} {child.lastname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vaccine Selection */}
          <div>
            <label className="font-medium text-gray-700">Select Vaccine *</label>
            <div className="flex items-center mt-2 bg-gray-100 rounded-xl px-4">
              <Syringe className="w-5 h-5 text-gray-500 mr-2" />
              <select
                name="vaccineId"
                onChange={handleChange}
                value={form.vaccineId}
                className="w-full py-3 bg-transparent outline-none"
                required
              >
                <option value="">Select a vaccine</option>
                {vaccineOptions.map((vaccine) => (
                  <option key={vaccine.id} value={vaccine.id}>
                    {vaccine.vaccine_name} - {vaccine.description}
                  </option>
                ))}
              </select>
            </div>
            {vaccineOptions.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                No vaccine options available. Please contact your administrator.
              </p>
            )}
          </div>

          {/* Dose Number Selection */}
          <div>
            <label className="font-medium text-gray-700">Dose Number *</label>
            <select
              name="doseNum"
              value={form.doseNum}
              onChange={handleChange}
              className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 outline-none"
              required
              disabled={!form.vaccineId || schedules.length === 0}
            >
              <option value="">Select dose number</option>
              {getAvailableDoses().map((dose) => (
                <option key={dose} value={dose}>
                  Dose {dose}
                </option>
              ))}
            </select>
            {form.vaccineId && schedules.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                No schedules available for this vaccine.
              </p>
            )}
          </div>

          {/* Schedule ID (Auto-selected, read-only) */}
          {form.scheduleId && (
            <div>
              <label className="font-medium text-gray-700">Schedule ID (Auto-selected)</label>
              <div className="flex items-center mt-2 bg-gray-200 rounded-xl px-4">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  value={form.scheduleId}
                  className="w-full py-3 bg-transparent outline-none text-gray-600"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Automatically selected based on vaccine and dose
              </p>
            </div>
          )}

          {/* Date Given */}
          <div>
            <label className="font-medium text-gray-700">Date Given *</label>
            <div className="flex items-center mt-2 bg-gray-100 rounded-xl px-4">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="date"
                name="dateGiven"
                value={form.dateGiven}
                onChange={handleChange}
                className="w-full py-3 bg-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="font-medium text-gray-700">Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-2 bg-gray-100 rounded-xl px-4 py-3 outline-none"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Given">Given</option>
              <option value="Missed">Missed</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Save Vaccination
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVaccination;