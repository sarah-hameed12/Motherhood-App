import { Users, Baby, Plus, AlertCircle, X, TrendingUp, Target, Heart } from "lucide-react";
import { createPortal } from "react-dom";
import ChildCard from "./ChildCard";
import AddChildCard from "./AddChild";
import ActiveChildDetails from "./ActiveChildDetails";
import AddChild from "../AddChild";
import { getRequest } from "../../api/requests";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import type { ChildPersonal } from "../../interfaces/ChildInterfaces";

interface ChildrenSectionProps {
  activeChild: number;
  onSelectChild: (index: number) => void;
  setChildrenLength: (length: number) => void;
}

const ChildrenSection = ({
  activeChild,
  onSelectChild,
  setChildrenLength,
}: ChildrenSectionProps) => {
  const { user, accessToken } = useAuth();
  const [children, setChildren] = useState<ChildPersonal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const childrenData = await getRequest("/user-profile/get-children");
      setChildrenLength(childrenData.length);
      setChildren(childrenData);
      if (childrenData.length > children.length) {
        onSelectChild(childrenData.length - 1);
      }
    } catch (err: any) {
      setError("Please try again or contact the support team!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user?.id) {
      fetchChildren();
    } else {
      setChildren([]);
      setChildrenLength(0);
    }
  }, [accessToken, user?.id]);

  // Modal rendered via portal so it overlays the ENTIRE page (sidebar, header, everything)
  const modal = isModalOpen
    ? createPortal(
        <>
          {/* Full-page blurred backdrop */}
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

          {/* Centered modal card */}
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

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e5989b] rounded-full shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Children</h2>
                <p className="text-sm text-gray-600">Family Profiles</p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
              0 registered
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center shadow-inner">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchChildren()}
            className="inline-flex items-center bg-[#e5989b] hover:bg-[#d88a8d] text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 ${
          loading ? "blur-sm opacity-90" : ""
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e5989b] rounded-full shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Children</h2>
                <p className="text-sm text-gray-600">Family Profiles</p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
              {loading ? "..." : `${children.length} registered`}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {children.length === 0 && !loading ? (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fceaea] to-[#f8d8d8] flex items-center justify-center shadow-inner">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f8d8d8] to-[#fceaea] flex items-center justify-center shadow-sm">
                      <Baby className="w-12 h-12 text-[#e5989b]" />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">No children exist</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Add your first child's profile to track their growth and milestones.
              </p>

              <button
                onClick={handleOpenModal}
                className="inline-flex items-center bg-[#e5989b] hover:bg-[#d88a8d] text-white px-8 py-3.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-[1.02] group"
              >
                <div className="mr-2 p-1 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                  <Plus className="w-4 h-4" />
                </div>
                Add Your First Child
              </button>

              {/* Feature highlights — Lucide icons instead of raw emoji */}
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-[#fceaea] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#e5989b]" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Track Growth</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-[#f8d8d8] rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#e5989b]" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Milestones</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 bg-[#fceaea] rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#e5989b]" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Memories</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Select a Child</h3>
                  <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {children.length} profile{children.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {children.map((child, index) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      index={index}
                      activeChild={activeChild}
                      onSelectChild={onSelectChild}
                    />
                  ))}
                  <AddChildCard onChildAdded={fetchChildren} />
                </div>
              </div>

              {children[activeChild] && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#e5989b] rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      Active Child Details
                    </h3>
                    <span className="text-xs font-medium text-[#e5989b] bg-[#fceaea] px-3 py-1 rounded-full">
                      Currently Selected
                    </span>
                  </div>
                  <ActiveChildDetails child={children[activeChild]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Portal-rendered modal — lives in document.body, above everything */}
      {modal}
    </>
  );
};

export default ChildrenSection;