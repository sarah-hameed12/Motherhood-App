import { useState, useEffect, useRef } from "react";
import CommunityCenter from "../components/community/CommunityCenter";
import CommunityLeftSidebar from "../components/community/CommunityLeftBar";
import CommunityRightSidebar from "../components/community/CommunityRightBar";
import { X, Search, ArrowLeft, Loader2, Heart, MessageCircle } from "lucide-react";
import { getRequest } from "../api/requests";

const Community = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  // Refs for debounce timer
  const debounceTimerRef = useRef<number | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Debounce function to handle typing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 500); // 500ms debounce delay
  };

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      const query = debouncedQuery;
      
      if (!query || query.length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Cancel previous request if exists
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      searchAbortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setIsSearching(true);
      
      try {
        const data = await getRequest(
          `/community/search?q=${encodeURIComponent(query)}`);
        setSearchResults(data);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Search API failed:", error);
          setSearchResults([]);
        }
      } finally {
        setIsLoading(false);
        searchAbortControllerRef.current = null;
      }
    };

    performSearch();

    // Cleanup function
    return () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  // Handle Enter key for immediate search (optional)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      // Trigger immediate search
      setDebouncedQuery(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
    setIsSearching(false);
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Cancel any pending request
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
      searchAbortControllerRef.current = null;
    }
  };

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isLeftSidebarOpen || isRightSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLeftSidebarOpen, isRightSidebarOpen]);

  // Close sidebar when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains("sidebar-overlay")) {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen m-0 p-0 bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Desktop Fixed Left Sidebar */}
          <div className="hidden lg:block fixed left-15 top-0 h-screen w-1/4 pl-6 pr-4 pt-20 overflow-y-auto custom-scrollbar z-30">
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 min-h-full">
              <CommunityLeftSidebar />
            </div>
          </div>

          {/* Desktop Fixed Right Sidebar */}
          <div className="hidden lg:block fixed right-0 top-0 h-screen w-1/4 pr-6 pl-4 pt-20 overflow-y-auto custom-scrollbar z-30">
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 min-h-full">
              <CommunityRightSidebar />
            </div>
          </div>

          {/* Center Content */}
          <div className="lg:mx-auto lg:w-1/2 px-3 sm:px-4 lg:px-6 pt-4 pb-24">
            
            {/* Mobile Sidebar Toggle Buttons */}
            <div className="lg:hidden flex gap-3 mb-6">
              <button
                onClick={() => setIsLeftSidebarOpen(true)}
                className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#fceaea]">
                    <svg className="w-4 h-4 text-[#e5989b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Menu</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#e5989b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => setIsRightSidebarOpen(true)}
                className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#fceaea]">
                    <svg className="w-4 h-4 text-[#e5989b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Info</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#e5989b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Search Bar - Capsule Style Above Feed */}
            <div className="mb-6 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#e5989b]" />
              </div>
              <input
                type="text"
                placeholder="Search posts"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-14 pr-5 py-3.5 bg-white border border-gray-200 rounded-full shadow-md focus:ring-2 focus:ring-[#e5989b]/30 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-700 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-[#e5989b]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {isLoading && searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-12 flex items-center">
                  <Loader2 className="w-4 h-4 text-[#e5989b] animate-spin" />
                </div>
              )}
            </div>

            {/* Unified Feed Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Header with Community Feed Title */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Community Feed</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Share your parenting journey</p>
              </div>

              {/* Content Display Logic */}
              <div className="p-4 sm:p-5">
                {isLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-10 h-10 text-[#e5989b] animate-spin" />
                    <p className="mt-4 text-gray-500 font-medium">Finding posts...</p>
                  </div>
                ) : isSearching ? (
                  /* --- SEARCH RESULTS VIEW --- */
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Search Results</h3>
                        <p className="text-sm text-gray-500">Showing results for "{searchQuery}"</p>
                      </div>
                      <button 
                        onClick={clearSearch}
                        className="flex items-center gap-1 text-sm font-bold text-[#e5989b] hover:underline"
                      >
                        <ArrowLeft className="w-4 h-4" /> Clear
                      </button>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-4">
                        {searchResults.map((post) => (
                          <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                            {/* Post Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                  <img 
                                    src={post.user?.profile_pic || `https://ui-avatars.com/api/?name=${post.user?.firstname}`} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm">{post.user?.firstname} {post.user?.lastname}</h4>
                                  <p className="text-xs text-gray-500">@{post.user?.username}</p>
                                </div>
                              </div>
                              <span className="px-2 py-1 bg-[#fceaea] text-[#e5989b] text-xs font-medium rounded-full">
                                {post.post_type || 'Support'}
                              </span>
                            </div>

                            {/* Post Content */}
                            <h3 className="font-bold text-gray-900 mb-1 text-sm">{post.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{post.description}</p>

                            {/* Post Image */}
                            {post.images && post.images.length > 0 && (
                              <div className="mb-3">
                                <img 
                                  src={post.images[0]} 
                                  alt="Post visual" 
                                  className="w-full rounded-lg object-cover max-h-64"
                                />
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs">
                              <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{post.like_count || 0}</span>
                              </button>
                              <button className="flex items-center gap-1 text-gray-500 hover:text-[#e5989b] transition-colors">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-bold">No results found</h3>
                        <p className="text-gray-500 text-sm">We couldn't find anything matching your search.</p>
                      </div>
                    )}
                  </>
                ) : (
                  /* --- REGULAR FEED --- */
                  <CommunityCenter />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Left Sidebar Popup */}
        {isLeftSidebarOpen && (
          <>
            <div 
              className="sidebar-overlay lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={handleOverlayClick}
            />
            <div className="lg:hidden fixed top-0 left-0 right-0 h-[70vh] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-t-2xl overflow-hidden translate-y-[15vh]">
              <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Community Menu</h3>
                <button onClick={() => setIsLeftSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors">
                  <X className="w-5 h-5 text-[#e5989b]" />
                </button>
              </div>
              <div className="h-[calc(70vh-60px)] overflow-y-auto p-4 custom-scrollbar">
                <CommunityLeftSidebar />
              </div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full opacity-70"></div>
            </div>
          </>
        )}

        {/* Mobile Right Sidebar Popup */}
        {isRightSidebarOpen && (
          <>
            <div 
              className="sidebar-overlay lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={handleOverlayClick}
            />
            <div className="lg:hidden fixed top-0 left-0 right-0 h-[70vh] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-t-2xl overflow-hidden translate-y-[15vh]">
              <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Community Info</h3>
                <button onClick={() => setIsRightSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors">
                  <X className="w-5 h-5 text-[#e5989b]" />
                </button>
              </div>
              <div className="h-[calc(70vh-60px)] overflow-y-auto p-4 custom-scrollbar">
                <CommunityRightSidebar />
              </div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full opacity-70"></div>
            </div>
          </>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-40">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center text-[#e5989b]">
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-[#e5989b]">
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span className="text-xs font-medium">Chats</span>
            </button>
            <button onClick={() => setIsLeftSidebarOpen(true)} className="flex flex-col items-center text-gray-400 hover:text-[#e5989b]">
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-xs font-medium">Menu</span>
            </button>
            <button onClick={() => setIsRightSidebarOpen(true)} className="flex flex-col items-center text-gray-400 hover:text-[#e5989b]">
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 006 10a6 6 0 0112 0c0 .459-.031.909-.086 1.333A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Create Post Button */}
      <button className="lg:hidden fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-40">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default Community;