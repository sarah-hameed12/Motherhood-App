import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  MessageCircle,
  PlayCircle,
  X,
  Baby,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AddChild from "./AddChild";


const BottomBar = () => {
  const location = useLocation();
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
    { path: "/children", icon: Users, label: "Children" },
    { path: "/tutorials", icon: PlayCircle, label: "Tutorials" },
    { path: "/immunizations", icon: Calendar, label: "Vaccines" },
    { path: "/community", icon: MessageCircle, label: "Community" },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path === "/" ? "/__never__" : path)
    );
  };

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
                <AddChild onClose={handleCloseModal} />
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

  return (
    <>
      {/* Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden bg-white border-t border-gray-200 py-3 px-4">
        <div className="flex justify-around items-center">
          {/* Regular nav links */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative group ${
                  active
                    ? "text-[#e5989b]"
                    : "text-gray-500 hover:text-[#e5989b]"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 mb-2">
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-b-gray-800"></div>
                </span>
              </Link>
            );
          })}

          {/* Add Child button - aligned inline with others */}
          <button
            onClick={handleOpenModal}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative group text-gray-500 hover:text-[#e5989b]`}
          >
            <Baby className="w-6 h-6" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 mb-2">
              Add Child
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-b-gray-800"></div>
            </span>
          </button>
        </div>
      </div>

      {modal}
    </>
  );
};

export default BottomBar;