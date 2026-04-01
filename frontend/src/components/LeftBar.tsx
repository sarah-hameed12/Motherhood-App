import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  MessageCircle,
  Baby,
  Settings,
  LogOut,
  PlayCircle,
  X, // Added for the close button
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";

// --- IMPORT THE BASE ADD CHILD FORM ---
import AddChild from "./AddChild"; 

const LeftBar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // --- MODAL STATE (Exactly like your AddChildCard code) ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/tutorials", icon: PlayCircle, label: "Video Tutorials" },
    { path: "/children", icon: Users, label: "My Children" },
    { path: "/immunizations", icon: Calendar, label: "Immunizations" },
    { path: "/community", icon: MessageCircle, label: "Community" },
  ];

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path === "/" ? "/__never__" : path);
  };

  return (
    <>
      <div
        data-sidebar
        className="h-full bg-white shadow-lg border-r border-gray-200 flex flex-col w-20 hover:w-64 transition-all duration-300 group"
      >
        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-4 rounded-xl transition-all duration-200 relative ${
                  active
                    ? "bg-[#fceaea] text-[#e5989b] shadow-sm"
                    : "text-gray-600 hover:bg-[#fceaea] hover:text-[#e5989b]"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-7 h-7 flex-shrink-0 ${
                    active ? "text-[#e5989b]" : "text-gray-400 hover:text-[#e5989b]"
                  }`}
                />
                <span className="ml-4 font-medium absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Add Child Button (Triggering the Modal State) */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-full flex items-center p-4 rounded-xl bg-[#e5989b] text-white hover:bg-[#d88a8d] transition-all duration-200 shadow-sm relative text-left"
            title="Add Child"
          >
            <Baby className="w-7 h-7 flex-shrink-0" />
            <span className="ml-4 font-medium absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Add Child
            </span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <Link
            to="/settings"
            className={`flex items-center p-4 rounded-xl transition-all duration-200 relative ${
              isActive("/settings") ? "bg-[#fceaea] text-[#e5989b]" : "text-gray-600 hover:bg-[#fceaea] hover:text-[#e5989b]"
            }`}
          >
            <Settings className={`w-7 h-7 flex-shrink-0 ${isActive("/settings") ? "text-[#e5989b]" : "text-gray-400 hover:text-[#e5989b]"}`} />
            <span className="ml-4 font-medium absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Settings
            </span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center w-full p-4 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 relative disabled:opacity-50"
          >
            {loading ? (
              <div className="w-7 h-7 border-2 border-red-600 border-t-transparent animate-spin rounded-full" />
            ) : (
              <LogOut className="w-7 h-7 flex-shrink-0 text-gray-400" />
            )}
            <span className="ml-4 font-medium absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* --- THE MODAL (Integrated exactly like your AddChildCard component) --- */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9999] transition-all duration-300"
            onClick={handleCloseModal}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e5989b] via-[#d88a8d] to-[#e5989b]" />
              
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 group"
              >
                <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#e5989b] transition-colors" />
              </button>
              
              <div className="overflow-y-auto max-h-[90vh]">
                {/* We pass handleCloseModal to AddChild so it closes on success */}
                <AddChild onClose={handleCloseModal} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Styles for animation */}
      <style>{`
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: zoom-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </>
  );
};

export default LeftBar;