import { Link } from "react-router-dom";
import { 
  Heart, 
  Calendar, 
  Ruler,
  Syringe,
  Trophy,
  ExternalLink,
  Baby,
  Clock,
  Star
} from "lucide-react";
import type { ChildPersonal } from "../../interfaces/ChildInterfaces";


interface ActiveChildDetailsProps {
  child: ChildPersonal;
}


const ActiveChildDetails = ({ child }: ActiveChildDetailsProps) => {
  const calculateAge = (dateOfBirth: string): string => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age === 0) {
      const monthAge = today.getMonth() - birthDate.getMonth();
      if (monthAge === 1) return "1 month";
      if (monthAge > 1) return `${monthAge} months`;
      const weekAge = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weekAge === 1) return "1 week";
      if (weekAge > 1) return `${weekAge} weeks`;
      const dayAge = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayAge === 1) return "1 day";
      return `${dayAge} days`;
    }
    
    return age === 1 ? "1 year" : `${age} years`;
  };

  return (
    <div className="bg-gradient-to-br from-[#fff6f6] to-[#fceaea] rounded-xl sm:rounded-2xl p-4 border border-[#e5989b]/20 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-[#e5989b] flex-shrink-0 fill-[#e5989b]/20" />
          <span className="truncate">{child.firstname}'s Profile</span>
        </h3>
        <Link 
          to={`/child-detail/${child.id}`}
          className="text-xs text-[#e5989b] font-medium hover:text-[#d88a8d] transition-colors flex-shrink-0 text-right hover:underline flex items-center gap-1"
        >
          View Full Profile
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Profile Picture Section - Circular */}
        <div className="flex flex-col items-center space-y-3 flex-shrink-0">
          <div className="relative">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <img
                src={child.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt={`${child.firstname} ${child.lastname}`}
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
              />
              {/* Status indicator */}
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -inset-2 bg-gradient-to-br from-[#e5989b]/10 to-transparent rounded-full -z-10"></div>
          </div>
          <div className="text-center space-y-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-[140px] sm:max-w-[160px]">
              {child.firstname} {child.lastname}
            </h4>
            <div className="flex items-center justify-center gap-1.5">
              <Baby className="w-3 h-3 text-[#e5989b]" />
              <p className="text-xs text-gray-600 capitalize">{child.gender}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2.5">
            {/* Date of Birth */}
            <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg border border-[#e5989b]/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#f8d8d8] flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-[#e5989b]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Date of Birth</span>
              </div>
              <span className="text-xs text-gray-900 font-semibold text-right">
                {child.date_of_birth ? 
                  new Date(child.date_of_birth).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 
                  'N/A'
                }
              </span>
            </div>
            
            {/* Age */}
            <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg border border-[#e5989b]/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#f8d8d8] flex items-center justify-center">
                  <Clock className="w-3 h-3 text-[#e5989b]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Age</span>
              </div>
              <span className="text-xs text-gray-900 font-semibold">
                {child.date_of_birth ? calculateAge(child.date_of_birth) : "N/A"}
              </span>
            </div>
            
            {/* Status */}
            <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg border border-[#e5989b]/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#f8d8d8] flex items-center justify-center">
                  <Star className="w-3 h-3 text-[#e5989b]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Status</span>
              </div>
              <span className="text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Active
              </span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link
              to={`/childdetail/${child.id}/growth`}
              className="group flex flex-col items-center justify-center bg-white border border-[#e5989b]/20 rounded-xl py-2.5 px-1 text-center hover:bg-[#e5989b] transition-all duration-300 hover:shadow-md"
            >
              <div className="w-7 h-7 mb-1.5 rounded-full bg-[#fceaea] flex items-center justify-center group-hover:bg-white transition-colors">
                <Ruler className="w-3.5 h-3.5 text-[#e5989b] group-hover:text-[#e5989b]" />
              </div>
              <span className="text-xs font-medium text-[#e5989b] group-hover:text-white truncate w-full">Growth</span>
            </Link>
            
            <Link
              to={`/childdetail/${child.id}/vaccinations`}
              className="group flex flex-col items-center justify-center bg-white border border-[#e5989b]/20 rounded-xl py-2.5 px-1 text-center hover:bg-[#e5989b] transition-all duration-300 hover:shadow-md"
            >
              <div className="w-7 h-7 mb-1.5 rounded-full bg-[#fceaea] flex items-center justify-center group-hover:bg-white transition-colors">
                <Syringe className="w-3.5 h-3.5 text-[#e5989b] group-hover:text-[#e5989b]" />
              </div>
              <span className="text-xs font-medium text-[#e5989b] group-hover:text-white truncate w-full">Vaccines</span>
            </Link>
            
            <Link
              to={`/childdetail/${child.id}/milestones`}
              className="group flex flex-col items-center justify-center bg-white border border-[#e5989b]/20 rounded-xl py-2.5 px-1 text-center hover:bg-[#e5989b] transition-all duration-300 hover:shadow-md"
            >
              <div className="w-7 h-7 mb-1.5 rounded-full bg-[#fceaea] flex items-center justify-center group-hover:bg-white transition-colors">
                <Trophy className="w-3.5 h-3.5 text-[#e5989b] group-hover:text-[#e5989b]" />
              </div>
              <span className="text-xs font-medium text-[#e5989b] group-hover:text-white truncate w-full">Milestones</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveChildDetails;