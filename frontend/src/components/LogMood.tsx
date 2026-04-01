import { useState } from "react";
import { Heart, Zap, Wind, Coffee, Smile, MessageSquare, CheckCircle, AlertCircle, X } from "lucide-react";
import { postRequest } from "../api/requests";

interface LogMoodProps {
  onClose: () => void;
}

const LogMood = ({ onClose }: LogMoodProps) => {
  // States
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [apiResult, setApiResult] = useState<{ mood_status: string; message: string; average_score: number } | null>(null);

  const [form, setForm] = useState({
    energy_level: 3,
    food_quality: 3,
    overall_happiness: 3,
    sleep_quality: 3,
    stress_level: 3,
    notes: "",
  });

  const questions = [
    { key: "overall_happiness", label: "Overall Happiness", icon: Heart, color: "text-pink-500" },
    { key: "energy_level", label: "Energy Level", icon: Zap, color: "text-yellow-500" },
    { key: "sleep_quality", label: "Sleep Quality", icon: Wind, color: "text-blue-500" },
    { key: "food_quality", label: "Food Quality", icon: Coffee, color: "text-orange-500" },
    { key: "stress_level", label: "Stress Level (1-5)", icon: Smile, color: "text-purple-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await postRequest("/mood/calculate", form);
      setApiResult(response);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Mood calculation failed:", err);
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop - Clicking this calls onClose */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Close button in the corner */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {showSuccess && apiResult ? (
          <div className="p-6 text-center py-8 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Mood: {apiResult.mood_status}</h3>
            <p className="text-gray-600 mb-6">{apiResult.message}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-[#e5989b]">{apiResult.average_score}</p>
            </div>
            <button
            onClick={onClose}
            className="px-8 py-3 bg-[#e5989b] text-white rounded-xl font-bold hover:bg-[#d88a8d] transition-all shadow-md"
            >
            Done
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#fceaea] rounded-2xl flex items-center justify-center">
                    <Smile className="w-7 h-7 text-[#e5989b]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Calculate Your Mood</h1>
                    <p className="text-gray-500 text-sm">How have you been feeling lately?</p>
                </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q) => {
                const Icon = q.icon;
                return (
                  <div key={q.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${q.color}`} />
                        <label className="font-semibold text-gray-700">{q.label}</label>
                      </div>
                      <span className="text-[#e5989b] font-bold bg-[#fceaea] px-3 py-1 rounded-lg text-sm">
                        Level {form[q.key as keyof typeof form]}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setForm({ ...form, [q.key]: num })}
                          className={`flex-1 py-4 rounded-xl font-bold transition-all border-2 ${
                            form[q.key as keyof typeof form] === num
                              ? "bg-[#fceaea] border-[#e5989b] text-[#e5989b] shadow-inner"
                              : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <label className="font-semibold text-gray-700">Journal Notes</label>
                </div>
                <textarea
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-[#fceaea] focus:bg-white outline-none text-gray-600 transition-all"
                  rows={3}
                  placeholder="Anything else you'd like to note down?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg transition-all ${
                  loading 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-gradient-to-r from-[#e5989b] to-[#d88a8d] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? "Calculating..." : "Calculate Mood"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogMood;