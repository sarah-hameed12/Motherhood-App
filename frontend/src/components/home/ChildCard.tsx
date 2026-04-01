interface ChildCardProps {
  child: any;
  index: number;
  activeChild: number;
  onSelectChild: (index: number) => void;
}

const ChildCard = ({ child, index, activeChild, onSelectChild }: ChildCardProps) => (
  <div
    key={child.id}
    onClick={() => onSelectChild(index)}
    className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-3 border-2 transition-all duration-300 hover:shadow-lg group cursor-pointer ${
      activeChild === index
        ? "from-[#fff1f1] to-[#fceaea] border-[#e5989b] shadow-md"
        : "from-white to-gray-50 border-gray-200 hover:border-[#e5989b]/40"
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className="relative flex-shrink-0">
        {/* Rounded circle image */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14">
          <img
            src={child.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={`${child.firstname} ${child.lastname}`}
            className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
          />
          {/* Active indicator */}
          {activeChild === index && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#e5989b] border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        {/* Online status dot */}
        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-[#e5989b] transition-colors">
          {child.firstname} {child.lastname}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-gray-600 capitalize">{child.gender}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-600 truncate">
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
        {/* Age indicator */}
        {child.date_of_birth && (
          <div className="mt-1">
            <span className="inline-block px-1.5 py-0.5 text-xs bg-[#fceaea] text-[#e5989b] rounded-full">
              {calculateAge(child.date_of_birth)}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Helper function to calculate age
function calculateAge(dateOfBirth: string): string {
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
}

export default ChildCard;