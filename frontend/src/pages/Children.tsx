import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { getRequest } from "../api/requests";
import { Baby, Heart, Sparkles, X } from "lucide-react";
import { createPortal } from "react-dom";

import StatsHeader from "../components/children/StatsHeader";
import QuickActions from "../components/children/QuickActions";
import ChildCardChildrenPage from "../components/children/ChildCard";
import AddChild from "../components/AddChild";
import type { ChildMini } from "../interfaces/ChildrenInterfaces";

const Children = () => {
  const { accessToken, user } = useAuth();
  const [children, setChildren] = useState<ChildMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Modal helpers ──────────────────────────────────────────────
  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) handleCloseModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // ── Fetch children ─────────────────────────────────────────────
  const fetchChildren = async () => {
    try {
      const response = await getRequest("/user-profile/get-children");
      setChildren(response || []);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [accessToken]);

  // Apply blur to header/sidebar when action menu is open
  useEffect(() => {
    if (activeMenu) {
      const header = document.querySelector("header");
      const sidebar = document.querySelector("[data-sidebar]");
      if (header) header.classList.add("blur-sm", "transition-all", "duration-200");
      if (sidebar) sidebar.classList.add("blur-sm", "transition-all", "duration-200");
      return () => {
        if (header) header.classList.remove("blur-sm", "transition-all", "duration-200");
        if (sidebar) sidebar.classList.remove("blur-sm", "transition-all", "duration-200");
      };
    }
  }, [activeMenu]);

  const toggleMenu = (childId: string) => {
    setActiveMenu(activeMenu === childId ? null : childId);
  };

  // ── Portal modal (identical to page 1) ────────────────────────
  const modal = isModalOpen
    ? createPortal(
        <>
          <div
            onClick={handleCloseModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              transition: "all 0.2s ease",
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e5989b] via-[#d88a8d] to-[#e5989b]" />
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 group"
              >
                <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#e5989b] transition-colors" />
              </button>
              <div className="overflow-y-auto max-h-[90vh]">
                <AddChild
                  onClose={() => {
                    handleCloseModal();
                    fetchChildren(); // refresh list after adding
                  }}
                />
              </div>
            </div>
          </div>
          <style>{`
            @keyframes zoom-in {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
            .animate-in { animation: zoom-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) both; }
          `}</style>
        </>,
        document.body
      )
    : null;

  // ── Empty state ────────────────────────────────────────────────
  const EmptyState = () => (
    <div className="text-center py-8 sm:py-12 px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-[#fceaea] flex items-center justify-center">
        <Baby className="w-10 h-10 sm:w-12 sm:h-12 text-[#e5989b]" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        No children added yet
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-2">
        Start by adding your first child's profile to track their growth,
        vaccinations, and milestones.
      </p>
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center bg-[#e5989b] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#d88a8d] transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <span className="text-lg sm:text-xl mr-2">+</span>
        Add Your First Child
      </button>
    </div>
  );

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f7] via-white to-[#f0f9ff] px-4">
        <div className="text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full animate-pulse opacity-75"></div>
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <Baby className="w-10 h-10 sm:w-12 sm:h-12 text-[#e5989b] animate-bounce" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e5989b]/20 to-[#d88a8d]/20 rounded-full animate-ping"></div>
          </div>
          <div className="absolute top-1/3 left-1/4 animate-float-slow">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#e5989b] opacity-60" fill="#e5989b" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float-medium">
            <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-[#d88a8d] opacity-50" fill="#d88a8d" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-float-fast">
            <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-pink-300 opacity-70" />
          </div>
          <p className="text-gray-600 text-base sm:text-lg font-medium animate-pulse mt-4">
            Loading your little ones...
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 animate-pulse" style={{ animationDelay: "0.5s" }}>
            Getting everything ready for you ✨
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#d88a8d] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff5f7] via-white to-[#f0f9ff]">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-[#e5989b]/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tl from-[#d88a8d]/5 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 py-4 sm:py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <StatsHeader user={user} children={children} />

            <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
              {children.length > 0 ? (
                children.map((child: ChildMini) => (
                  <div key={child.id}>
                    <ChildCardChildrenPage
                      child={child}
                      activeMenu={activeMenu}
                      onToggleMenu={toggleMenu}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-4 sm:mt-8 hover:shadow-md transition-shadow">
                  <EmptyState />
                </div>
              )}
            </div>

            {/* QuickActions component */}
            <QuickActions
              childrenCount={children.length}
            />

            {activeMenu && (
              <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />
            )}
          </div>
        </div>

        <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: float-medium 4s ease-in-out infinite;
          }
          .animate-float-fast {
            animation: float-fast 3s ease-in-out infinite;
          }
        `}</style>
      </div>

      {modal}
    </>
  );
};

export default Children;