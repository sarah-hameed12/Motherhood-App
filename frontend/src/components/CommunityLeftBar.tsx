// components/community/LeftSidebar.tsx
import React, { useEffect, useState } from 'react';
import { Users, Zap, MessageCircle, TrendingUp, X } from 'lucide-react';
import { getRequest } from '../api/requests';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, description, color }: StatCardProps) => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{value}</p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </div>
    </div>
  </div>
);

interface LeftSidebarProps {
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  showMobileSidebar, 
  setShowMobileSidebar 
}) => {
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    postsToday: 0,
    activeDiscussions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch total members
      const totalMembersResponse = await getRequest('/community/members/all');
      
      // Fetch today's posts count
      const todayPostsResponse = await getRequest('/community/posts/latest');
      
      // Calculate online members (you might need a separate endpoint for this)
      // For now, we'll estimate it as 20% of total members or show a placeholder
      const estimatedOnlineMembers = Math.floor(totalMembersResponse * 0.2);
      
      setCommunityStats({
        totalMembers: totalMembersResponse || 0,
        onlineMembers: estimatedOnlineMembers,
        postsToday: todayPostsResponse || 0,
        activeDiscussions: 0 // You might need another endpoint for this
      });
    } catch (err: any) {
      console.error('Error fetching community stats:', err);
      setError('Failed to load community statistics');
      // Set fallback values
      setCommunityStats({
        totalMembers: 0,
        onlineMembers: 0,
        postsToday: 0,
        activeDiscussions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  // Refresh stats every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCommunityStats();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  if (loading && communityStats.totalMembers === 0) {
    return (
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#e5989b]" />
              Community Stats
            </h3>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="bg-gray-200 h-24 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
          <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideInLeft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Community Stats</h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{error}</p>
                  <button
                    onClick={fetchCommunityStats}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <StatCard 
                    title="Total Members" 
                    value={communityStats.totalMembers.toLocaleString()} 
                    icon={Users}
                    color="from-blue-100 to-blue-200"
                  />
                  <StatCard 
                    title="Online Now" 
                    value={communityStats.onlineMembers} 
                    icon={Zap}
                    color="from-green-100 to-green-200"
                    description="Active members"
                  />
                  <StatCard 
                    title="Posts Today" 
                    value={communityStats.postsToday} 
                    icon={MessageCircle}
                    color="from-purple-100 to-purple-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#e5989b]" />
                Community Stats
              </h3>
              <button
                onClick={fetchCommunityStats}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="Refresh stats"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#e5989b] rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
            
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={fetchCommunityStats}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <StatCard 
                  title="Total Members" 
                  value={communityStats.totalMembers.toLocaleString()} 
                  icon={Users}
                  color="from-blue-100 to-blue-200"
                />
                <StatCard 
                  title="Online Now" 
                  value={communityStats.onlineMembers} 
                  icon={Zap}
                  color="from-green-100 to-green-200"
                  description="Active members"
                />
                <StatCard 
                  title="Posts Today" 
                  value={communityStats.postsToday} 
                  icon={MessageCircle}
                  color="from-purple-100 to-purple-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;