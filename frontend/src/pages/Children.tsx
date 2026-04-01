import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getRequest } from "../api/requests";
import { Baby, Plus } from "lucide-react";

import StatsHeader from "../components/children/StatsHeader";
import QuickActions from "../components/children/QuickActions";
import ChildCardChildrenPage from "../components/children/ChildCard";


// Interfaces
import type { ChildMini } from "../interfaces/ChildrenInterfaces";

const Children = () => {
  const { accessToken, user } = useAuth();
  const [children, setChildren] = useState<ChildMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await getRequest("/user-profile/get-children");
        console.log("Children: ", response);
        setChildren(response || []);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [accessToken]);

  // Apply blur effect to header and sidebar when popup is open
  useEffect(() => {
    if (activeMenu) {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('[data-sidebar]');
      if (header) header.classList.add('blur-sm');
      if (sidebar) sidebar.classList.add('blur-sm');

      return () => {
        if (header) header.classList.remove('blur-sm');
        if (sidebar) sidebar.classList.remove('blur-sm');
      };
    }
  }, [activeMenu]);

  const toggleMenu = (childId: string) => {
    setActiveMenu(activeMenu === childId ? null : childId);
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#fceaea] flex items-center justify-center">
        <Baby className="w-12 h-12 text-[#e5989b]" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No children added yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start by adding your first child's profile to track their growth,
        vaccinations, and milestones.
      </p>
      <Link
        to="/add-child"
        className="inline-flex items-center bg-[#e5989b] text-white px-6 py-3 rounded-lg hover:bg-[#d88a8d] transition-colors font-medium"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Your First Child
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-[#fff6f6]">
        Loading your children...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff5f7] via-white to-[#f0f9ff]">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/40 via-transparent to-transparent"></div>

      {/* Epic floating orbs with animation */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
        {/* Large pink orb - top left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-[#ffe0e6] via-[#ffeef1] to-transparent rounded-full opacity-50 blur-3xl animate-pulse"></div>

        {/* Blue orb - top right */}
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-[#dbeafe] via-[#eff6ff] to-transparent rounded-full opacity-40 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Purple accent - middle */}
        <div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#fae8ff] via-[#fdf4ff] to-transparent rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Peach orb - bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-tr from-[#fed7d7] via-[#fff5f5] to-transparent rounded-full opacity-40 blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Mint accent - bottom right */}
        <div
          className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#d1fae5] via-[#f0fdf4] to-transparent rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Floating particles/sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-ping"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-ping"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-ping"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-400 rounded-full opacity-60 animate-ping"
          style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Enhanced dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5989b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(229,152,155,0.1),transparent_50%)]"></div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatsHeader user={user} children={children} />

          <div className="space-y-6 mt-8">
            {children.length > 0 ? (
              children.map((child: ChildMini) => (
                <div key={child.id}> {/* Changed id to key */}
                  <ChildCardChildrenPage
                    child={child} // Added child prop
                    activeMenu={activeMenu} // Added activeMenu prop
                    onToggleMenu={toggleMenu} // Added onToggleMenu prop
                  />
                </div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 hover:shadow-md transition-shadow">
                <EmptyState />
              </div>
            )}
          </div>

          <QuickActions childrenCount={children.length} />

          {activeMenu && (
            <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Children;