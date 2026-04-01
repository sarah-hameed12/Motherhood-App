import { type LucideIcon, ArrowUp, ArrowDown } from "lucide-react";


interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down";
  change?: number;
  description?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  change,
  description,
}: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mb-2 truncate">{description}</p>
        )}
        {trend && change !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#fceaea] to-[#f8d8d8] group-hover:from-[#f8d8d8] group-hover:to-[#fceaea] transition-all duration-300 flex-shrink-0 ml-2">
        <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#e5989b]" />
      </div>
    </div>
  </div>
);

export default StatCard;