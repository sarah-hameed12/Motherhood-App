import { Baby, Sparkles } from "lucide-react";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff6f6] via-[#fceaea] to-[#f8d8d8]">
    <div className="text-center space-y-6">
      {/* Animated Baby Icon */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 w-28 h-28 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl blur-lg opacity-40 animate-pulse" />
        
        {/* Main icon with sparkles */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg flex items-center justify-center group">
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#e5989b] animate-bounce" />
          <Baby className="w-12 h-12 text-[#e5989b] group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      {/* Loading text with cute dots */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Getting things ready for you
        </h2>
        
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        
        <p className="text-gray-600 text-sm">
          Your parenting dashboard is loading...
        </p>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;