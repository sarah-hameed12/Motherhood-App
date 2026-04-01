// components/community/RightSidebar.tsx
import React from 'react';
import { Star, Users2 } from 'lucide-react';

interface RightSidebarProps {
  // Add any props you might need in the future
}

const RightSidebar: React.FC<RightSidebarProps> = () => {
  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="sticky top-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#e5989b]" />
            Top Contributors
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users2 className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 text-sm">
                Coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;