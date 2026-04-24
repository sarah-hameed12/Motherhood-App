import {
  Baby,
  MessageCircle,
  Award,
} from "lucide-react";

import WelcomeSection from "../components/home/WelcomeSection";
import StatCard from "../components/home/StatCard";
import ChildrenSection from "../components/home/ChildrenSection";
import QuickActionsSection from "../components/home/QuickActionsSection";

import { useState } from "react";
import { useAuth } from "../context/authContext";

const Home = () => {
  const { user } = useAuth();
  const [activeChild, setActiveChild] = useState(0);
  const [childrenLength, setChildrenLength] = useState<number>(0);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Background Image */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#fff5f7] z-0 h-[500px] sm:h-[550px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white"></div>
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full pt-8 pb-8">
            <WelcomeSection firstName={user?.firstname} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard
                title="My Children"
                value={childrenLength}
                icon={Baby}
                description="Total registered"
              />
              <StatCard
                title="Community Messages"
                value={5}
                icon={MessageCircle}
                description="Unread messages"
              />
              <StatCard
                title="Trust Score"
                value="100%"
                icon={Award}
                description="Reliable"
                trend="up"
                change={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full py-4 sm:py-6 pb-28 sm:pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <ChildrenSection
                activeChild={activeChild}
                onSelectChild={setActiveChild}
                setChildrenLength={setChildrenLength}
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <QuickActionsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;