import { Baby, Syringe, Heart } from "lucide-react";

interface StatsHeaderProps {
  user: any;
  children: any[];
}

const StatsHeader = ({ user, children }: StatsHeaderProps) => {
  const quotes = [
    "Every child is a different kind of flower, and together they make this world a beautiful garden 🌸",
    "Little hands, big dreams, and hearts full of love 💕",
    "Growing up is a journey, and we're here to help you every step of the way 🌈",
    "Making childhood memories, one milestone at a time ✨",
    "Your children are the greatest treasures, and their health is our priority 💝",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: string | number;
    icon: any;
  }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition hover:shadow-lg hover:scale-105 transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-[#fceaea]">
          <Icon className="w-6 h-6 text-[#e5989b]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My Children, <span className="text-[#e5989b]">{user?.firstname}</span>
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage your children's profiles and track their development
        </p>
      </div>

      {/* Stats Summary - Only 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
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
      </div>

      {/* Cute Quote Card */}
      <div className="mt-6 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] rounded-xl p-4 sm:p-5 border border-[#e5989b]/20 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#e5989b] animate-pulse" fill="#e5989b" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#e5989b] uppercase tracking-wide">Daily Dose of Love</p>
            <p className="text-sm sm:text-base text-gray-700 italic mt-1">{randomQuote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;