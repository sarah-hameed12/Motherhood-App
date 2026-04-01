import { Link } from "react-router-dom";
import { Syringe, TrendingUp, Baby, Users } from "lucide-react";


const QuickActionsSection = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
      <h3 className="text-base sm:text-lg font-bold text-gray-900">Quick Actions</h3>
    </div>
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/vaccinations"
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 text-center hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200 hover:shadow-md group"
        >
          <Syringe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-900">Vaccinations</span>
        </Link>
        <Link
          to="/growth"
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 text-center hover:from-green-100 hover:to-green-200 transition-all duration-300 border border-green-200 hover:shadow-md group"
        >
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-900">Growth Track</span>
        </Link>
        <Link
          to="/milestones"
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 text-center hover:from-purple-100 hover:to-purple-200 transition-all duration-300 border border-purple-200 hover:shadow-md group"
        >
          <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-900">Milestones</span>
        </Link>
        <Link
          to="/community"
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 text-center hover:from-orange-100 hover:to-orange-200 transition-all duration-300 border border-orange-200 hover:shadow-md group"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-900">Community</span>
        </Link>
      </div>
    </div>
  </div>
);

export default QuickActionsSection;