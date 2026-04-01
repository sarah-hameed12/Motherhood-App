const MainLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
      <div className="text-center space-y-8">
        {/* Heart-themed spinner */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl animate-pulse flex items-center justify-center mx-auto">
            <svg 
              className="w-10 h-10 text-white animate-pulse" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#e5989b] rounded-full animate-ping opacity-75"></div>
        </div>
        
        {/* Text content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to <span className="bg-gradient-to-r from-[#e5989b] to-[#d88a8d] bg-clip-text text-transparent">Nurtura</span>
          </h1>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">Loading your family dashboard</p>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLoading;