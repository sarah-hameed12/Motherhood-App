import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import AddChild from "../AddChild";

interface AddChildCardProps {
  onChildAdded?: () => void;
}

const AddChildCard: React.FC<AddChildCardProps> = ({ onChildAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleChildAdded = () => {
    if (onChildAdded) {
      onChildAdded();
    }
    handleCloseModal();
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

  return (
    <>
      {/* Add Child Button */}
      <button
        onClick={handleOpenModal}
        className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2.5 border-2 border-dashed border-gray-300 hover:border-[#e5989b] hover:from-[#fff1f1] hover:to-[#fceaea] transition-all duration-300 flex items-center justify-center gap-2 w-full cursor-pointer"
      >
        <div className="w-6 h-6 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Plus className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[#e5989b] font-medium text-xs">Add Child</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop - No blur */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9999] transition-all duration-300"
            onClick={handleCloseModal}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              {/* Decorative Header */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e5989b] via-[#d88a8d] to-[#e5989b]" />
              
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 group"
              >
                <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#e5989b] transition-colors" />
              </button>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[90vh]">
                <AddChild onClose={handleChildAdded} />
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-duration: 0.2s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        
        .zoom-in {
          animation-name: zoom-in;
        }
      `}</style>
    </>
  );
};

export default AddChildCard;