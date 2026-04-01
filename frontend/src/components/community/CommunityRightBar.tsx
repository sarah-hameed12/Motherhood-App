import { Heart, FileText, AlertCircle, History } from "lucide-react";
import { useEffect, useState } from "react";
import { getRequest } from "../../api/requests";

const CommunityRightSidebar = () => {
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [myReportsCount, setMyReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        setLoading(true);
        // Using your exact routes: /api/community/my-posts and /api/community/my-reports
        const [posts, reports] = await Promise.all([
          getRequest('/community/my-posts'),
          getRequest('/community/my-reports')
        ]);
        setMyPostsCount(Array.isArray(posts) ? posts.length : 0);
        setMyReportsCount(Array.isArray(reports) ? reports.length : 0);
      } catch (err) {
        console.error("Personal data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-[#e5989b]" />
            Your Activity
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Posts Created</span>
            </div>
            <span className="text-sm font-black text-gray-900">{loading ? "..." : myPostsCount}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-gray-700">Reports Filed</span>
            </div>
            <span className="text-sm font-black text-gray-900">{loading ? "..." : myReportsCount}</span>
          </div>
        </div>
      </div>

      {/* Helpful Tip Section (Static - No Backend Needed) */}
      <div className="bg-[#fff6f6] rounded-2xl p-5 border border-[#e5989b]/10">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-[#e5989b] fill-[#e5989b]" />
          <h4 className="font-bold text-[#e5989b] text-xs uppercase tracking-widest">Parenting Tip</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed italic">
          "Consistency is key in parenting. Try to keep meal times and bed times similar every day."
        </p>
      </div>
    </div>
  );
};

export default CommunityRightSidebar;