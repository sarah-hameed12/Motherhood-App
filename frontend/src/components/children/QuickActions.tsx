import { Link } from "react-router-dom";
import { Syringe, TrendingUp, Heart } from "lucide-react";


interface QuickActionsProps {
  childrenCount: number;
}


const QuickActions = ({ childrenCount }: QuickActionsProps) => {
  if (childrenCount === 0) return null;

  return (
    <div className="mt-12 pb-16 sm:pb-20 md:pb-24 lg:pb-32">
      <h2 className="text-xl font-semibold text-[#e5989b] mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/vaccinations"
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-[#fceaea] group-hover:bg-[#f8d8d8] transition-colors">
              <Syringe className="w-6 h-6 text-[#e5989b]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vaccination Schedule</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage all vaccinations</p>
            </div>
          </div>
        </Link>

        <Link
          to="/growth-tracking"
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-[#fceaea] group-hover:bg-[#f8d8d8] transition-colors">
              <TrendingUp className="w-6 h-6 text-[#e5989b]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Growth Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor growth charts and percentiles</p>
            </div>
          </div>
        </Link>

        <Link
          to="/milestones"
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-[#fceaea] group-hover:bg-[#f8d8d8] transition-colors">
              <Heart className="w-6 h-6 text-[#e5989b]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Development Milestones</h3>
              <p className="text-sm text-gray-600 mt-1">Track developmental progress</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;