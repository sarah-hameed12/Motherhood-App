// components/common/SuccessToast.tsx
import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  showViewButton?: boolean;
  onViewClick?: () => void;
}

const SuccessToast = ({ 
  message, 
  onClose, 
  duration = 5000,
  showViewButton = false,
  onViewClick 
}: SuccessToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-xl shadow-2xl border border-green-200 max-w-sm">
        {/* Toast Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700">Success!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>

        {/* Toast Body */}
        <div className="p-4">
          <p className="text-gray-700">{message}</p>
          
          {showViewButton && onViewClick && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={onViewClick}
                className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-lg hover:opacity-90 transition-all"
              >
                View Post
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-xl">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-xl animate-progress"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;