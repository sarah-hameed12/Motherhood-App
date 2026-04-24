import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getRequest, postRequest } from "../api/requests";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { ArrowLeft, Weight, Ruler, Brain, Plus, X, Info } from "lucide-react";

// ── WHO Child Growth Standards (0–24 months) ──────────────────────────────────
// Source: WHO Child Growth Standards, 2006
// Each array index = month of age (0 to 24)

const WHO_STANDARDS = {
  girl: {
    weight: {
      median: [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.9,11.1,11.3,11.5],
      sd2neg: [2.4,3.2,3.9,4.5,5.0,5.4,5.7,6.0,6.3,6.5,6.7,6.9,7.1,7.2,7.4,7.6,7.7,7.9,8.1,8.2,8.4,8.6,8.8,9.0,9.2],
      sd2pos: [4.2,5.5,6.6,7.5,8.1,8.8,9.3,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.6,12.9,13.2,13.5,13.7,14.1,14.4,14.7,15.0],
    },
    height: {
      median: [49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.4],
      sd2neg: [45.4,49.8,53.0,55.6,57.8,59.6,61.2,62.7,64.0,65.3,66.5,67.7,68.9,70.0,71.0,72.0,73.0,74.0,74.9,75.8,76.7,77.5,78.4,79.2,80.0],
      sd2pos: [52.9,57.6,61.1,64.0,66.4,68.5,70.3,71.9,73.5,74.9,76.4,77.8,79.2,80.5,81.7,82.9,84.1,85.2,86.4,87.5,88.7,89.8,90.8,91.9,92.9],
    },
    head: {
      median: [33.9,36.9,38.6,39.9,41.0,41.9,42.6,43.2,43.7,44.2,44.6,45.0,45.3,45.6,45.9,46.2,46.4,46.6,46.8,47.0,47.2,47.4,47.5,47.7,47.8],
      sd2neg: [31.7,34.6,36.3,37.5,38.6,39.5,40.2,40.7,41.2,41.6,42.0,42.4,42.7,43.0,43.3,43.5,43.8,44.0,44.2,44.3,44.5,44.7,44.9,45.0,45.1],
      sd2pos: [36.1,39.2,40.9,42.3,43.4,44.3,45.1,45.7,46.2,46.7,47.1,47.5,47.9,48.2,48.5,48.8,49.1,49.3,49.5,49.7,49.9,50.1,50.3,50.4,50.6],
    },
  },
  boy: {
    weight: {
      median: [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.8,12.0,12.2],
      sd2neg: [2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,7.0,7.2,7.5,7.7,7.8,8.0,8.2,8.4,8.6,8.7,8.9,9.1,9.2,9.4,9.6,9.8,10.0],
      sd2pos: [4.4,5.8,7.1,8.0,8.7,9.3,9.8,10.3,10.7,11.0,11.4,11.7,12.0,12.3,12.6,12.9,13.1,13.4,13.7,14.0,14.2,14.5,14.8,15.1,15.4],
    },
    height: {
      median: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8],
      sd2neg: [46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,76.0,76.9,77.7,78.6,79.4,80.2,81.0,81.8],
      sd2pos: [53.7,58.6,62.4,65.5,68.0,70.1,71.9,73.5,75.0,76.5,77.9,79.2,80.5,81.8,82.9,84.2,85.4,86.5,87.7,88.8,89.9,90.9,91.9,92.9,93.8],
    },
    head: {
      median: [34.5,37.3,39.1,40.5,41.6,42.6,43.3,44.0,44.5,45.0,45.4,45.8,46.1,46.4,46.7,46.9,47.2,47.4,47.6,47.8,48.0,48.2,48.3,48.5,48.7],
      sd2neg: [32.1,34.8,36.6,37.9,39.0,39.9,40.6,41.2,41.7,42.1,42.5,42.9,43.2,43.5,43.7,44.0,44.2,44.4,44.6,44.8,45.0,45.1,45.3,45.5,45.6],
      sd2pos: [36.9,39.8,41.6,43.1,44.3,45.3,46.1,46.8,47.3,47.8,48.3,48.7,49.0,49.3,49.6,49.9,50.2,50.4,50.6,50.8,51.0,51.2,51.4,51.5,51.7],
    },
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface TransformedGrowthData {
  date: string;
  fullDate: string;
  weight: number | null;
  height: number | null;
  headCircumference: number | null;
  timestamp: number;
  ageMonths: number | null;
  // WHO reference fields injected per data point
  whoWeightMedian?: number;
  whoWeightLow?: number;
  whoWeightHigh?: number;
  whoHeightMedian?: number;
  whoHeightLow?: number;
  whoHeightHigh?: number;
  whoHeadMedian?: number;
  whoHeadLow?: number;
  whoHeadHigh?: number;
}

interface ChildInfo {
  firstname: string;
  lastname: string;
  id: string;
  gender?: "male" | "female" | "boy" | "girl";
  date_of_birth?: string;
}

interface ChartStats {
  min: number;
  max: number;
  latest: number;
  change: number;
  whoStatus: "normal" | "low" | "high" | "unknown";
  whoMedian: number;
}

interface FormData {
  recorded_at: string;
  weight: string;
  height: string;
  head_circumference: string;
  milestone_notes: string;
}

// ── WHO helpers ────────────────────────────────────────────────────────────────

type SexKey = "girl" | "boy";
type MetricKey = "weight" | "height" | "head";

function getSex(childInfo: ChildInfo | null): SexKey {
  const g = childInfo?.gender?.toLowerCase();
  if (g === "male" || g === "boy") return "boy";
  return "girl"; // default to girl
}

function getAgeMonths(dob: string | undefined, recordDate: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const record = new Date(recordDate);
  const months =
    (record.getFullYear() - birth.getFullYear()) * 12 +
    (record.getMonth() - birth.getMonth());
  return Math.max(0, Math.min(months, 24));
}

function getWhoValue(sex: SexKey, metric: MetricKey, ageMonths: number | null, field: "median" | "sd2neg" | "sd2pos"): number | undefined {
  if (ageMonths === null || ageMonths < 0 || ageMonths > 24) return undefined;
  return WHO_STANDARDS[sex][metric][field][Math.round(ageMonths)];
}

function getWhoStatus(value: number, low: number | undefined, high: number | undefined): "normal" | "low" | "high" | "unknown" {
  if (low === undefined || high === undefined) return "unknown";
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: "normal" | "low" | "high" | "unknown" }) => {
  const cfg = {
    normal: { bg: "bg-green-100", text: "text-green-700", label: "Healthy Range" },
    low:    { bg: "bg-amber-100", text: "text-amber-700", label: "Below Range" },
    high:   { bg: "bg-red-100",   text: "text-red-700",   label: "Above Range" },
    unknown:{ bg: "bg-gray-100",  text: "text-gray-500",  label: "No WHO data" },
  }[status];

  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
  whoLowKey,
  whoHighKey,
  whoMedianKey,
}: any) => {
  if (!active || !payload || !payload.length) return null;

  const childEntry = payload.find((p: any) => p.dataKey && !p.dataKey.toString().startsWith("who"));
  const childVal = childEntry?.value;
  const dataPoint = payload[0]?.payload;
  const whoLow = dataPoint?.[whoLowKey];
  const whoHigh = dataPoint?.[whoHighKey];
  const whoMedian = dataPoint?.[whoMedianKey];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label}</p>
      {childVal !== undefined && childVal !== null && (
        <p className="text-[#e5989b] font-medium">
          Your child: <span className="font-bold">{childVal} {unit}</span>
        </p>
      )}
      {whoMedian !== undefined && (
        <p className="text-emerald-600 text-xs mt-1">WHO median: {whoMedian} {unit}</p>
      )}
      {whoLow !== undefined && whoHigh !== undefined && (
        <p className="text-gray-500 text-xs">Normal range: {whoLow}–{whoHigh} {unit}</p>
      )}
      {childVal !== null && childVal !== undefined && whoLow !== undefined && whoHigh !== undefined && (
        <div className="mt-2 pt-1 border-t border-gray-100">
          <StatusBadge status={getWhoStatus(childVal, whoLow, whoHigh)} />
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const ChildGrowthTracking = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [growthData, setGrowthData] = useState<TransformedGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWhoInfo, setShowWhoInfo] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    recorded_at: new Date().toISOString().split("T")[0],
    weight: "",
    height: "",
    head_circumference: "",
    milestone_notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const handleOpenModal = () => {
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) handleCloseModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  // ── Transform + inject WHO data ──────────────────────────────────────────────
  const transformRecords = (records: any[], child: ChildInfo | null): TransformedGrowthData[] => {
    const sex = getSex(child);
    return records
      .map((record: any) => {
        const ageMonths = getAgeMonths(child?.date_of_birth, record.recorded_at);
        return {
          date: new Date(record.recorded_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
          fullDate: record.recorded_at,
          weight: record.weight,
          height: record.height,
          headCircumference: record.head_circumference,
          timestamp: new Date(record.recorded_at).getTime(),
          ageMonths,
          // WHO weight
          whoWeightMedian: getWhoValue(sex, "weight", ageMonths, "median"),
          whoWeightLow:    getWhoValue(sex, "weight", ageMonths, "sd2neg"),
          whoWeightHigh:   getWhoValue(sex, "weight", ageMonths, "sd2pos"),
          // WHO height
          whoHeightMedian: getWhoValue(sex, "height", ageMonths, "median"),
          whoHeightLow:    getWhoValue(sex, "height", ageMonths, "sd2neg"),
          whoHeightHigh:   getWhoValue(sex, "height", ageMonths, "sd2pos"),
          // WHO head
          whoHeadMedian: getWhoValue(sex, "head", ageMonths, "median"),
          whoHeadLow:    getWhoValue(sex, "head", ageMonths, "sd2neg"),
          whoHeadHigh:   getWhoValue(sex, "head", ageMonths, "sd2pos"),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        const response = await getRequest(`/child/detail/${childId}`);
        setChildInfo(response);
        return response;
      } catch (err) {
        console.error("Error fetching child info:", err);
        return null;
      }
    };

    const fetchGrowthData = async (child: ChildInfo | null) => {
      try {
        setLoading(true);
        const response = await getRequest(`/child-growth/list/${childId}`);
        setGrowthData(transformRecords(response || [], child));
        setError(null);
      } catch (err) {
        console.error("Error fetching growth data:", err);
        setError("Failed to load growth data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchChildInfo().then((child) => fetchGrowthData(child));
    }
  }, [childId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.recorded_at || !formData.weight || !formData.height || !formData.head_circumference) {
      setError("Please fill in all required fields (date, weight, height, head circumference)");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        child_id: childId,
        recorded_at: formData.recorded_at,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        head_circumference: parseFloat(formData.head_circumference),
        milestone_notes: formData.milestone_notes || undefined,
      };

      await postRequest("/child-growth/create", payload);

      setFormData({
        recorded_at: new Date().toISOString().split("T")[0],
        weight: "",
        height: "",
        head_circumference: "",
        milestone_notes: "",
      });
      handleCloseModal();
      setError(null);

      const response = await getRequest(`/child-growth/list/${childId}`);
      setGrowthData(transformRecords(response || [], childInfo));
    } catch (err) {
      console.error("Error creating growth record:", err);
      setError("Failed to create growth record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Chart stats ──────────────────────────────────────────────────────────────
  const getChartStats = (
    dataKey: "weight" | "height" | "headCircumference",
    whoLowKey: keyof TransformedGrowthData,
    whoHighKey: keyof TransformedGrowthData,
    whoMedianKey: keyof TransformedGrowthData
  ): ChartStats => {
    if (growthData.length === 0)
      return { min: 0, max: 0, latest: 0, change: 0, whoStatus: "unknown", whoMedian: 0 };

    const values = growthData
      .map((d) => d[dataKey])
      .filter((v): v is number => typeof v === "number" && v > 0);

    if (values.length === 0)
      return { min: 0, max: 0, latest: 0, change: 0, whoStatus: "unknown", whoMedian: 0 };

    const latest = values[values.length - 1];
    const lastRecord = growthData[growthData.length - 1];
    const whoLow = lastRecord[whoLowKey] as number | undefined;
    const whoHigh = lastRecord[whoHighKey] as number | undefined;
    const whoMedian = (lastRecord[whoMedianKey] as number) ?? 0;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      latest,
      change: values.length > 1 ? parseFloat((latest - values[0]).toFixed(2)) : 0,
      whoStatus: getWhoStatus(latest, whoLow, whoHigh),
      whoMedian,
    };
  };

  // ── WHO info banner ──────────────────────────────────────────────────────────
  const WhoInfoBanner = () => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
      <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-emerald-800 mb-1">About WHO Growth Standards</p>
        <p className="text-sm text-emerald-700">
          The shaded green band on each chart shows the <strong>WHO Child Growth Standards</strong> normal range
          (−2SD to +2SD). The dashed green line is the WHO median. Values within the band are considered
          healthy for most children. If your child's measurements consistently fall outside the band,
          consult your pediatrician.
        </p>
        {!childInfo?.date_of_birth && (
          <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ Date of birth not found in child profile. WHO reference lines require age — please update
            the child's profile with their date of birth for accurate comparisons.
          </p>
        )}
      </div>
    </div>
  );

  // ── Chart Card ───────────────────────────────────────────────────────────────
  interface ChartCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    dataKey: "weight" | "height" | "headCircumference";
    unit: string;
    whoLowKey: keyof TransformedGrowthData;
    whoHighKey: keyof TransformedGrowthData;
    whoMedianKey: keyof TransformedGrowthData;
  }

  const ChartCard = ({
    title,
    icon: Icon,
    dataKey,
    unit,
    whoLowKey,
    whoHighKey,
    whoMedianKey,
  }: ChartCardProps) => {
    const stats = getChartStats(dataKey, whoLowKey, whoHighKey, whoMedianKey);

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-all">
        {/* Card Header */}
        <div className="flex items-center space-x-3 mb-4 md:mb-6">
          <div className="p-2 md:p-3 rounded-full bg-[#fceaea]">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#e5989b]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs md:text-sm text-gray-500">Progress over time vs. WHO standards</p>
          </div>
          <StatusBadge status={stats.whoStatus} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="bg-[#fceaea] rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-500">Your child</p>
            <p className="text-sm md:text-base font-bold text-[#e5989b]">
              {stats.latest} {unit}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-500">WHO median</p>
            <p className="text-sm md:text-base font-bold text-emerald-600">
              {stats.whoMedian || "—"} {stats.whoMedian ? unit : ""}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-500">Recorded min</p>
            <p className="text-sm md:text-base font-bold text-blue-600">
              {stats.min} {unit}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 md:p-3">
            <p className="text-xs text-gray-500">Recorded max</p>
            <p className="text-sm md:text-base font-bold text-green-600">
              {stats.max} {unit}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 bg-[#e5989b] rounded" />
            Your child
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 border-t-2 border-dashed border-emerald-500" />
            WHO median
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded bg-emerald-100 border border-emerald-300" />
            Normal range (±2SD)
          </span>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: "10px" }}
              tickMargin={5}
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: "10px" }} width={35} />

            {/* WHO normal range band */}
            <ReferenceArea
              y1={0}
              y2={0}
              fill="#d1fae5"
              fillOpacity={0}
            />

            {/* WHO shaded band drawn as area between whoLow and whoHigh lines */}
            <Line
              type="monotone"
              dataKey={whoLowKey as string}
              stroke="#6ee7b7"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="WHO lower (-2SD)"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey={whoHighKey as string}
              stroke="#6ee7b7"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="WHO upper (+2SD)"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey={whoMedianKey as string}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name="WHO median"
              legendType="none"
            />

            {/* Child's actual data */}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#e5989b"
              strokeWidth={2.5}
              dot={{ fill: "#e5989b", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#e5989b" }}
              name="Your child"
              connectNulls={false}
            />

            <Tooltip
              content={
                <CustomTooltip
                  unit={unit}
                  whoLowKey={whoLowKey}
                  whoHighKey={whoHighKey}
                  whoMedianKey={whoMedianKey}
                />
              }
            />
            <Legend
              wrapperStyle={{ display: "none" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs md:text-sm">
          <span className="text-gray-500">
            Total change:{" "}
            <span className={`font-semibold ${stats.change > 0 ? "text-green-600" : "text-gray-600"}`}>
              {stats.change > 0 ? "+" : ""}
              {stats.change} {unit}
            </span>
          </span>
          {stats.whoStatus !== "unknown" && (
            <span className="text-gray-500">
              Difference from WHO median:{" "}
              <span
                className={`font-semibold ${
                  stats.whoStatus === "normal"
                    ? "text-green-600"
                    : stats.whoStatus === "low"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {stats.latest > stats.whoMedian ? "+" : ""}
                {(stats.latest - stats.whoMedian).toFixed(1)} {unit}
              </span>
            </span>
          )}
        </div>
      </div>
    );
  };

  // ── Portal modal ─────────────────────────────────────────────────────────────
  const modal = showModal
    ? createPortal(
        <>
          <style>{`
            @keyframes modal-in {
              from { opacity: 0; transform: scale(0.95) translateY(8px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);   }
            }
            .growth-modal-animate { animation: modal-in 0.22s cubic-bezier(0.4, 0, 0.2, 1) both; }
            .growth-modal-scroll::-webkit-scrollbar { width: 5px; }
            .growth-modal-scroll::-webkit-scrollbar-track { background: #fceaea; border-radius: 99px; }
            .growth-modal-scroll::-webkit-scrollbar-thumb { background: #e5989b; border-radius: 99px; }
            .growth-modal-scroll::-webkit-scrollbar-thumb:hover { background: #d88a8d; }
            .growth-modal-scroll { scrollbar-width: thin; scrollbar-color: #e5989b #fceaea; }
          `}</style>

          <div
            onClick={handleCloseModal}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              transition: "all 0.2s ease",
            }}
          />

          <div
            style={{
              position: "fixed", inset: 0, zIndex: 10000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div className="growth-modal-animate relative w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e5989b] via-[#d88a8d] to-[#e5989b]" />
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 group"
              >
                <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#e5989b] transition-colors" />
              </button>

              <div className="growth-modal-scroll overflow-y-auto max-h-[88vh] p-4 sm:p-6 pt-7">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 pr-8">
                  Add Growth Record
                </h2>

                <form onSubmit={handleSubmitRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="recorded_at"
                      value={formData.recorded_at}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" name="weight" step="0.1"
                      value={formData.weight} onChange={handleInputChange}
                      placeholder="e.g., 5.5"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Height (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" name="height" step="0.1"
                      value={formData.height} onChange={handleInputChange}
                      placeholder="e.g., 65.5"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Head Circumference (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" name="head_circumference" step="0.1"
                      value={formData.head_circumference} onChange={handleInputChange}
                      placeholder="e.g., 41.5"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Milestone Notes{" "}
                      <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      name="milestone_notes"
                      value={formData.milestone_notes}
                      onChange={handleInputChange}
                      placeholder="Any notes about development or milestones..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e5989b] focus:border-transparent outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-1">
                    <button
                      type="button" onClick={handleCloseModal}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" disabled={submitting}
                      className="flex-1 bg-[#e5989b] text-white py-2.5 rounded-lg font-medium hover:bg-[#d88a8d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Add Record</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff6f6]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#fceaea] flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-[#e5989b] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading growth data...</p>
        </div>
      </div>
    );
  }

  const sex = getSex(childInfo);

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#fff6f6] py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[#e5989b] hover:text-[#d88a8d] mb-3 md:mb-4 font-medium transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Growth Tracking
                  {childInfo && (
                    <span className="text-[#e5989b] ml-1 md:ml-2 block md:inline">
                      {childInfo.firstname} {childInfo.lastname}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                  Monitor {childInfo?.firstname || "your child"}'s development with WHO standard comparisons
                </p>
                {childInfo?.gender && (
                  <p className="text-xs text-gray-400 mt-1">
                    Using WHO {sex} standards
                    {childInfo.date_of_birth && (
                      <> · DOB: {new Date(childInfo.date_of_birth).toLocaleDateString()}</>
                    )}
                  </p>
                )}
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => setShowWhoInfo(!showWhoInfo)}
                  className="border border-emerald-300 text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium flex items-center justify-center space-x-2 text-sm"
                >
                  <Info className="w-4 h-4" />
                  <span>WHO Info</span>
                </button>
                <button
                  onClick={handleOpenModal}
                  className="bg-[#e5989b] text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg hover:bg-[#d88a8d] transition-colors font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Add New Record</span>
                </button>
              </div>
            </div>
          </div>

          {/* WHO info banner (toggleable) */}
          {showWhoInfo && <WhoInfoBanner />}

          {/* Summary Stats */}
          {growthData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {[
                {
                  label: "Current Height",
                  icon: Ruler,
                  value: getChartStats("height", "whoHeightLow", "whoHeightHigh", "whoHeightMedian").latest,
                  unit: "cm",
                  status: getChartStats("height", "whoHeightLow", "whoHeightHigh", "whoHeightMedian").whoStatus,
                },
                {
                  label: "Current Weight",
                  icon: Weight,
                  value: getChartStats("weight", "whoWeightLow", "whoWeightHigh", "whoWeightMedian").latest,
                  unit: "kg",
                  status: getChartStats("weight", "whoWeightLow", "whoWeightHigh", "whoWeightMedian").whoStatus,
                },
                {
                  label: "Head Circumference",
                  icon: Brain,
                  value: getChartStats("headCircumference", "whoHeadLow", "whoHeadHigh", "whoHeadMedian").latest,
                  unit: "cm",
                  status: getChartStats("headCircumference", "whoHeadLow", "whoHeadHigh", "whoHeadMedian").whoStatus,
                },
              ].map(({ label, icon: Icon, value, unit, status }) => (
                <div key={label} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
                  <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                    <div className="p-2 md:p-3 rounded-full bg-[#fceaea]">
                      <Icon className="w-4 h-4 md:w-6 md:h-6 text-[#e5989b]" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">{label}</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">
                        {value} {unit}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {growthData.length > 0 ? (
            <div className="space-y-6 md:space-y-8">
              <ChartCard
                title="Height Growth"
                icon={Ruler}
                dataKey="height"
                unit="cm"
                whoLowKey="whoHeightLow"
                whoHighKey="whoHeightHigh"
                whoMedianKey="whoHeightMedian"
              />
              <ChartCard
                title="Weight Growth"
                icon={Weight}
                dataKey="weight"
                unit="kg"
                whoLowKey="whoWeightLow"
                whoHighKey="whoWeightHigh"
                whoMedianKey="whoWeightMedian"
              />
              <ChartCard
                title="Head Circumference Growth"
                icon={Brain}
                dataKey="headCircumference"
                unit="cm"
                whoLowKey="whoHeadLow"
                whoHighKey="whoHeadHigh"
                whoMedianKey="whoHeadMedian"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-12 text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-[#fceaea] flex items-center justify-center">
                <Ruler className="w-8 h-8 md:w-12 md:h-12 text-[#e5989b]" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                No growth records yet
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                Start tracking {childInfo?.firstname || "your child"}'s growth by adding measurement records.
                WHO standard comparison lines will appear automatically.
              </p>
              <button
                onClick={handleOpenModal}
                className="bg-[#e5989b] text-white px-4 py-2.5 rounded-lg hover:bg-[#d88a8d] transition-colors font-medium flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Record</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 md:mt-8 bg-red-50 border border-red-200 rounded-xl p-4 md:p-6">
              <p className="text-red-700 font-medium text-sm md:text-base">{error}</p>
            </div>
          )}
        </div>
      </div>

      {modal}
    </>
  );
};

export default ChildGrowthTracking;