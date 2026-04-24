import { Link } from "react-router-dom";
import { Syringe, Users, PlayCircle } from "lucide-react";


const QuickActionsSection = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
      <h3 className="text-base sm:text-lg font-bold text-gray-900">Quick Actions</h3>
    </div>
    <div className="p-4 sm:p-5">
      <div className="flex flex-col gap-3">
        <Link
          to="/immunizations"
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200 hover:shadow-md group"
        >
          <div className="flex items-center justify-center gap-3">
            <Syringe className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-base sm:text-lg font-semibold text-gray-900">Immunizations</span>
          </div>
        </Link>
        
        <Link
          to="/tutorials"
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center hover:from-green-100 hover:to-green-200 transition-all duration-300 border border-green-200 hover:shadow-md group"
        >
          <div className="flex items-center justify-center gap-3">
            <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-base sm:text-lg font-semibold text-gray-900">Tutorials</span>
          </div>
        </Link>
        
        <Link
          to="/community"
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center hover:from-orange-100 hover:to-orange-200 transition-all duration-300 border border-orange-200 hover:shadow-md group"
        >
          <div className="flex items-center justify-center gap-3">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-base sm:text-lg font-semibold text-gray-900">Community</span>
          </div>
        </Link>
      </div>
    </div>
  </div>
);

export default QuickActionsSection;