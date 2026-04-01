import { useState, useRef, useEffect } from "react";
import { Edit, Trash2, Flag, Bookmark, EyeOff, Link, X } from "lucide-react";


interface DotBarProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void; // More specific type
  onHide?: () => void;
  onCopyLink?: () => void;
}

const DotBar = ({
  isOpen,
  onClose,
  position,
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
  onSave,
  onHide,
  onCopyLink,
}: DotBarProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
    } else {
      // Default copy functionality
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    }
    setTimeout(() => onClose(), 500);
  };

  const handleAction = (callback?: (e?: React.MouseEvent<HTMLButtonElement>) => void, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (callback) {
      callback(e);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Adjust position if menu would go off-screen
  const adjustedPosition = {
    top: Math.min(position.y, window.innerHeight - 320),
    left: Math.min(position.x, window.innerWidth - 220),
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
        }}
      >
        {/* Close button for mobile */}
        <button
          className="sm:hidden absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Owner Actions */}
        {isOwner && (
          <>
            <button
              onClick={(e) => handleAction(onEdit, e)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Post
            </button>
            <button
              onClick={(e) => handleAction(onDelete, e)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </button>
            <div className="border-t border-gray-100 my-2" />
          </>
        )}

        {/* General Actions */}
        <button
          onClick={(e) => handleAction(onSave, e)}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          Save Post
        </button>

        <button
          onClick={(e) => handleAction(onHide, e)}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          Hide Post
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Link className="w-4 h-4" />
          {copied ? "Link Copied!" : "Copy Link"}
        </button>

        {/* Report Action (non-owner only) */}
        {!isOwner && (
          <>
            <div className="border-t border-gray-100 my-2" />
            <button
              onClick={(e) => handleAction(onReport, e)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Report Post
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default DotBar;