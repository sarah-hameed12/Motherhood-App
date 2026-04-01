import { Users, MessageSquare, TrendingUp, PlusCircle, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { getRequest } from "../../api/requests";

interface LeftSidebarProps {
  onCreateClick?: () => void;
}

const CommunityLeftSidebar: React.FC<LeftSidebarProps> = ({ onCreateClick }) => {
  const [stats, setStats] = useState({ totalMembers: 0, postsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [members, posts] = await Promise.all([
          getRequest('/community/members/all'),
          getRequest('/community/posts/latest')
        ]);
        setStats({
          totalMembers: members || 0,
          postsToday: posts || 0
        });
      } catch (err) {
        console.error("Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- EVENT TRIGGERS ---
  const triggerCreatePost = () => {
    if (onCreateClick) onCreateClick();
    window.dispatchEvent(new CustomEvent("open-community-create-modal"));
  };

  const triggerViewReports = () => {
    window.dispatchEvent(new CustomEvent("open-community-reports-modal"));
  };

  // NEW: Trigger for My Posts List
  const triggerViewMyPosts = () => {
    window.dispatchEvent(new CustomEvent("open-community-myposts-modal"));
  };

  // NEW: Trigger for Members List
  const triggerViewMembers = () => {
    window.dispatchEvent(new CustomEvent("open-community-members-modal"));
  };

  return (
    <div className="p-5 space-y-6">
      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#e5989b]" />
          Community Stats
        </h3>
        
        <div className="space-y-4">
          {/* MEMBERS STAT - NOW CLICKABLE */}
          <div 
            onClick={triggerViewMembers}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-all active:scale-95"
          >
            <div className="p-2 rounded-xl bg-[#fff6f6] text-[#e5989b]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Members</p>
              <p className="text-lg font-black text-gray-900">{loading ? "..." : stats.totalMembers.toLocaleString()}</p>
            </div>
          </div>

          {/* POSTS TODAY STAT - NOW CLICKABLE */}
          <div 
            onClick={triggerViewMyPosts}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-all active:scale-95"
          >
            <div className="p-2 rounded-xl bg-[#fff6f6] text-[#e5989b]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Posts Today</p>
              <p className="text-lg font-black text-gray-900">{loading ? "..." : stats.postsToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Buttons */}
      <div className="space-y-2">
        <button 
          onClick={triggerCreatePost}
          className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-[#fff6f6] rounded-xl transition-all group active:scale-95"
        >
          <PlusCircle className="w-5 h-5 text-[#e5989b]" />
          <span className="font-bold text-sm">Create New Post</span>
        </button>

        <button 
          onClick={triggerViewReports}
          className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-[#fff6f6] rounded-xl transition-all group active:scale-95"
        >
          <ShieldAlert className="w-5 h-5 text-[#e5989b]" />
          <span className="font-bold text-sm">My Reports</span>
        </button>
      </div>
    </div>
  );
};

export default CommunityLeftSidebar;