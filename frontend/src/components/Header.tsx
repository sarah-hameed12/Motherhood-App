import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState, useRef, useEffect } from "react";
import { Search, Baby, X, ChevronDown, User, Settings, LogOut, Sparkles, Syringe, Users, Bot, Activity, GraduationCap } from "lucide-react";
import MainLoading from "./MainLoading";
import { Smile } from "lucide-react";
import LogMood from "./LogMood";
import Chatbot from "./chatbot/Chatbot";

const Header = () => {
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isLogMoodOpen, setIsLogMoodOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const iconButtonClass = "w-12 h-12 flex items-center justify-center text-gray-600 hover:text-[#e5989b] transition-colors duration-200 rounded-xl hover:bg-[#fceaea] shadow-sm relative group";

  // Search suggestions data with exact paths
  const searchSuggestions = [
    {
      category: "Tutorials",
      icon: GraduationCap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      path: "/tutorials",
      description: "Browse all parenting tutorials"
    },
    {
      category: "Children",
      icon: Baby,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      path: "/children",
      description: "View and manage all children"
    },
    {
      category: "Vaccinations",
      icon: Syringe,
      color: "text-green-600",
      bgColor: "bg-green-100",
      path: "/immunizations",
      description: "View all immunization records"
    },
    {
      category: "Community",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      path: "/community",
      description: "Connect with other parents"
    },
    {
      category: "Settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      path: "/settings",
      description: "Manage your account preferences"
    },
    {
      category: "AI Assistant",
      icon: Bot,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      path: "#",
      description: "Get personalized support",
      action: "openChatbot"
    },
    {
      category: "Log Mood",
      icon: Smile,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      path: "#",
      description: "Track your emotional wellbeing",
      action: "openMood"
    }
  ];

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.trim() === "" 
    ? searchSuggestions 
    : searchSuggestions.filter(suggestion => 
        suggestion.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!accessToken) {
    return <MainLoading />;
  }

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setShowSearchDropdown(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery(""); 
      setShowSearchDropdown(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchDropdown(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
      }
    }, 150);
  };

  const handleLinkClick = (suggestion: any) => {
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
    setSearchQuery("");
    
    if (suggestion.action === "openChatbot") {
      openChatbot();
    } else if (suggestion.action === "openMood") {
      setIsLogMoodOpen(true);
    } else if (suggestion.path && suggestion.path !== "#") {
      window.location.href = suggestion.path;
    }
  };

  const openChatbot = () => {
    setIsChatbotOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChatbot = () => {
    setIsChatbotOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <header className={`bg-white shadow-sm border-b border-gray-200 w-full transition-all duration-300 ${
        isChatbotOpen ? 'opacity-0 pointer-events-none' : ''
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center shadow-md">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-[#e5989b] to-[#d88a8d] bg-clip-text text-transparent hidden sm:block"
              >
                Nurra
              </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-6 hidden lg:block relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl blur-sm transition-all duration-300 ${
                    isSearchFocused ? 'opacity-60' : 'opacity-30 group-hover:opacity-50'
                  }`}></div>
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10 transition-colors duration-300 ${
                      isSearchFocused ? 'text-white' : 'text-[#e5989b]'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search tutorials, children, vaccinations, community..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className="w-full pl-12 pr-12 py-3 border-2 border-transparent bg-white/95 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl"
                    />
                  </div>
                </div>
              </form>

              {/* Search Dropdown with custom scrollbar */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto search-dropdown">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#fceaea] to-white sticky top-0 z-10">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#e5989b]" />
                      Quick Navigation
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Jump to any section instantly</p>
                  </div>
                  
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLinkClick(suggestion)}
                      className="w-full px-4 py-3 hover:bg-[#fceaea] transition-colors duration-150 flex items-center gap-3 group border-b border-gray-50 last:border-0"
                    >
                      <div className={`w-10 h-10 ${suggestion.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <suggestion.icon className={`w-5 h-5 ${suggestion.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#e5989b] transition-colors">
                          {suggestion.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{suggestion.description}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all -rotate-90 group-hover:translate-x-1" />
                    </button>
                  ))}

                  {searchQuery && filteredSuggestions.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">No results found</p>
                      <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
                    </div>
                  )}

                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 sticky bottom-0">
                    <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                      <Activity className="w-3 h-3" />
                      Type to filter • Click any link to navigate
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="lg:hidden">
                <button 
                  onClick={toggleSearch}
                  className="p-3 text-gray-600 hover:text-[#e5989b] transition-colors duration-200 rounded-xl hover:bg-[#fceaea] shadow-sm relative group"
                >
                  <Search className="w-5 h-5" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Search
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rotate-45"></div>
                  </div>
                </button>
              </div>

              {/* AI Assistant Icon */}
              <div className="relative">
                <button onClick={openChatbot} className={iconButtonClass}>
                  <Sparkles className="w-5 h-5" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    AI Assistant
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rotate-45"></div>
                  </div>
                </button>
              </div>

              {/* Log Mood Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsLogMoodOpen(true)}
                  className={iconButtonClass}>
                  <Smile className="w-5 h-5" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Log Mood
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rotate-45"></div>
                  </div>
                </button>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[#fceaea] transition-all duration-200 group"
                >
                  <div className="relative">
                    <img 
                      src={user?.profile_pic || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format"} 
                      alt={user?.firstname || "User"}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#e5989b]/30 shadow-sm group-hover:border-[#e5989b]/50 transition-colors duration-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="flex items-center space-x-1">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Profile Menu
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rotate-45"></div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstname} {user?.lastname}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        to={`/mother/${user?.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#fceaea] hover:text-[#e5989b] transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#fceaea] hover:text-[#e5989b] transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-1">
                      <button 
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {loading ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isSearchOpen && (
            <div className="lg:hidden pb-4 animate-in slide-in-from-top duration-300">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-xl blur-sm opacity-20"></div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e5989b] w-4 h-4 z-10" />
                    <input
                      type="text"
                      placeholder="Search tutorials, children, vaccinations, community..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className="w-full pl-10 pr-12 py-3 border-2 border-transparent bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b]/50 shadow-lg transition-all duration-300"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 relative group"
                    >
                      <X className="w-4 h-4" />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Close Search
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rotate-45"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3 border border-gray-100">
              <svg className="animate-spin h-6 w-6 text-[#e5989b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700">Logging out...</span>
            </div>
          </div>
        )}

        {isProfileMenuOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </header>

      {/* Chatbot Modal */}
      {isChatbotOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000]"
            onClick={closeChatbot}
          />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center">
            <div className="relative w-full h-full bg-white/95 backdrop-blur-sm overflow-hidden">
              <button
                onClick={closeChatbot}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
              >
                <X className="w-6 h-6 text-gray-600 group-hover:text-[#e5989b]" />
              </button>
              <div className="h-full">
                <Chatbot />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Log Mood Modal */}
      {isLogMoodOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            onClick={() => setIsLogMoodOpen(false)}
          />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsLogMoodOpen(false)}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <LogMood onClose={() => setIsLogMoodOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Custom scrollbar for search dropdown */
        .search-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        
        .search-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .search-dropdown::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #e5989b, #d88a8d);
          border-radius: 10px;
        }
        
        .search-dropdown::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #d88a8d, #c77a7d);
        }
        
        /* Firefox scrollbar */
        .search-dropdown {
          scrollbar-width: thin;
          scrollbar-color: #e5989b #f1f1f1;
        }
      `}</style>
    </>
  );
};

export default Header;