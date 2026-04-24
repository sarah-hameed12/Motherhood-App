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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/authContext";

import AddChild from "./AddChild";

const LeftBar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return (
      location.pathname === path ||
      location.pathname.startsWith(path === "/" ? "/__never__" : path)
    );
  };

  // Portal modal — renders at document.body level so it sits above
  // the header, sidebar, and every other element on the page
  const modal = isModalOpen
    ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {/* Full-viewport blur backdrop — covers header + sidebar */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={handleCloseModal}
          />

          {/* Modal card */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "28rem",
              backgroundColor: "white",
              borderRadius: "1rem",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              overflow: "hidden",
              animation: "addChildModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Top colour bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg, #e5989b, #d88a8d, #e5989b)",
              }}
            />

            {/* Close button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 20,
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "50%",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")
              }
            >
              <X size={14} color="#9ca3af" />
            </button>

            <div style={{ overflowY: "auto", maxHeight: "90vh" }}>
              <AddChild onClose={handleCloseModal} />
            </div>
          </div>

          <style>{`
            @keyframes addChildModalIn {
              from { opacity: 0; transform: scale(0.92) translateY(16px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
          `}</style>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        data-sidebar
        className="h-full bg-white shadow-lg border-r border-gray-200 flex flex-col w-16 hover:w-64 transition-all duration-300 group"
      >
        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-5 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#fceaea] text-[#e5989b] shadow-sm"
                    : "text-gray-600 hover:bg-[#fceaea] hover:text-[#e5989b]"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-6 h-6 flex-shrink-0 ${
                    active ? "text-[#e5989b]" : "text-gray-400 hover:text-[#e5989b]"
                  }`}
                />
                <span className="ml-3 text-base font-medium whitespace-nowrap overflow-hidden group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Add Child Button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-full flex items-center p-3.5 rounded-xl bg-[#e5989b] text-white hover:bg-[#d88a8d] transition-all duration-200 shadow-sm"
            title="Add Child"
          >
            <Baby className="w-6 h-6 flex-shrink-0" />
            <span className="ml-3 text-base font-medium whitespace-nowrap overflow-hidden group-hover:opacity-100 opacity-0 transition-opacity duration-200">
              Add Child
            </span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-gray-200 space-y-2">
          <Link
            to="/settings"
            className={`flex items-center p-3.5 rounded-xl transition-all duration-200 ${
              isActive("/settings")
                ? "bg-[#fceaea] text-[#e5989b]"
                : "text-gray-600 hover:bg-[#fceaea] hover:text-[#e5989b]"
            }`}
          >
            <Settings
              className={`w-6 h-6 flex-shrink-0 ${
                isActive("/settings") ? "text-[#e5989b]" : "text-gray-400 hover:text-[#e5989b]"
              }`}
            />
            <span className="ml-3 text-base font-medium whitespace-nowrap overflow-hidden group-hover:opacity-100 opacity-0 transition-opacity duration-200">
              Settings
            </span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center w-full p-3.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent animate-spin rounded-full" />
            ) : (
              <LogOut className="w-6 h-6 flex-shrink-0 text-gray-400" />
            )}
            <span className="ml-3 text-base font-medium whitespace-nowrap overflow-hidden group-hover:opacity-100 opacity-0 transition-opacity duration-200">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Portal renders outside sidebar DOM tree — covers everything */}
      {modal}
    </>
  );
};

export default LeftBar;