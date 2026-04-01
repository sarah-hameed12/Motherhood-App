import {
  Baby,
  TrendingUp,
  Bell,
  MessageCircle,
} from "lucide-react";

import WelcomeSection from "../components/home/WelcomeSection";
import StatCard from "../components/home/StatCard";
import ChildrenSection from "../components/home/ChildrenSection";
import QuickActionsSection from "../components/home/QuickActionsSection";


import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { getRequest } from "../api/requests";



const Home = () => {
  const { accessToken, user } = useAuth();



  const [reminders, setReminders] = useState<any[]>([]);
  const [activeChild, setActiveChild] = useState(0);

  const [childrenLength, setChildrenLength] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {


        const [remindersData] = await Promise.all([
          getRequest("/vaccination-reminders/"),
        ]);

        setReminders(remindersData || []);
      } catch (error) {
        console.error("Error fetching data:", error);

      } finally {
      }
    };

    if (accessToken && user?.id) {
      fetchData();
    } else {
    }
  }, [accessToken, user?.id]);

  
  



  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Background Image - Covers top area until Children Section */}
      <div className="relative">
        {/* Background Image Container - Covers welcome section and stats */}
        <div className="absolute inset-0 bg-[#fff5f7] z-0 h-[500px] sm:h-[550px]">
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full pt-8 pb-8">
            {/* Welcome Section */}
            <WelcomeSection firstName={user?.firstname} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard
                title="My Children"
                value={childrenLength}
                icon={Baby}
                description="Total registered"
              />
              <StatCard
                title="Vaccination Reminders"
                value={reminders.length || 0}
                icon={Bell}
                description="Active reminders"
                trend={reminders.length > 0 ? "up" : "down"}
                change={reminders.length > 0 ? 100 : 0}
              />
              <StatCard
                title="Community Messages"
                value={5}
                icon={MessageCircle}
                description="Unread messages"
              />
              <StatCard
                title="Milestones Completed"
                value="8/12"
                icon={TrendingUp}
                description="This month"
                trend="up"
                change={25}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section - Starts after the background image */}
      <div className="bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full py-4 sm:py-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <ChildrenSection
                activeChild={activeChild}
                onSelectChild={setActiveChild}
                setChildrenLength={setChildrenLength}
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* <RemindersSection/> */}

              <QuickActionsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;