import { Link } from "react-router-dom";
import { Plus, Baby, Syringe, TrendingUp, Calendar, ArrowUp, ArrowDown } from "lucide-react";

interface StatsHeaderProps {
  user: any;
  children: any[];
}

const StatsHeader = ({ user, children }: StatsHeaderProps) => {
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    change,
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    change?: number;
  }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && change !== undefined && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-[#fceaea]">
          <Icon className="w-6 h-6 text-[#e5989b]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Children, <span className="text-[#e5989b]">{user?.firstname}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your children's profiles and track their development
          </p>
        </div>
        <Link
          to="/add-child"
          className="inline-flex items-center bg-[#e5989b] text-white px-6 py-3 rounded-lg hover:bg-[#d88a8d] transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Child
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <StatCard 
          title="Total Children" 
          value={children.length} 
          icon={Baby} 
        />
        <StatCard 
          title="Pending Vaccinations" 
          value={children.reduce((acc, child) => acc + (child.upcomingVaccines || 0), 0)} 
          icon={Syringe} 
        />
        <StatCard 
          title="Milestones Achieved" 
          value={children.reduce((acc, child) => acc + (child.milestones?.achieved || 0), 0)} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Next Checkup" 
          value={new Date().toLocaleDateString()} 
          icon={Calendar} 
        />
      </div>
    </div>
  );
};

export default StatsHeader;