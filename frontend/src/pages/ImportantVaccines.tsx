import { useEffect, useState } from "react";
import type { VaccineUserView } from "../interfaces/VaccinationInterfaces";
import { getRequest } from "../api/requests";
import { 
  Syringe, 
  Shield, 
  AlertCircle, 
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Heart,
  ShieldAlert,
  Pill,
  Stethoscope,
  Thermometer,
  Brain,
  AlertTriangle,
  Sparkles,
  Filter,
  Bell,
  Download,
  Search,
  Menu,
  X
} from "lucide-react";

// Import the modal component
import VaccineDetailModal from "../components/vaccines/ImportantVaccineDetail";

const ImportantVaccines: React.FC = () => {
  const [vaccines, setVaccines] = useState<VaccineUserView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineUserView | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  console.log(vaccines);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRequest('/vaccines/fetch-all');
        setVaccines(response);
      } catch(err: any) {
        setError('Something went wrong! Please try again or contact the help center!');
        console.error("Error fetching vaccines:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVaccines();
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Helper function to convert days to readable age format
  const daysToReadableAge = (days: number): string => {
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  // Handle vaccine click
  const handleVaccineClick = (vaccine: VaccineUserView) => {
    setSelectedVaccine(vaccine);
    setShowDetailModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
  };

  // Filter vaccines based on search
  const filteredVaccines = vaccines.filter(vaccine =>
    vaccine.vaccine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaccine.vaccine_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get vaccine icon based on name
  const getVaccineIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('flu') || lowerName.includes('influenza')) return <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (lowerName.includes('measles') || lowerName.includes('mumps') || lowerName.includes('rubella')) return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (lowerName.includes('polio')) return <Brain className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (lowerName.includes('hepatitis')) return <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (lowerName.includes('tetanus') || lowerName.includes('diphtheria')) return <Pill className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <Syringe className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] via-white to-[#fceaea]">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-[#e5989b]/5 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-[#f8d8d8]/10 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>

        {/* Main Content - Blurred Skeleton */}
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Blurred Header */}
          <div className="mb-6 sm:mb-8 md:mb-12 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-200/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"></div>
                </div>
                <div className="flex-1">
                  <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-300/80 rounded-lg w-3/4 mb-2 sm:mb-3"></div>
                  <div className="h-4 sm:h-5 bg-gray-200/80 rounded w-full max-w-2xl"></div>
                </div>
              </div>
              
              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-200 rounded-lg">
                        <div className="w-4 h-4 sm:w-5 sm:h-5"></div>
                      </div>
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-6 sm:h-8 bg-gray-300 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <div className="w-full h-12 sm:h-14 bg-gray-200/90 backdrop-blur-sm rounded-xl sm:rounded-2xl"></div>
              </div>
              <div className="hidden md:flex gap-3">
                <div className="w-24 h-12 bg-gray-200/90 rounded-2xl"></div>
                <div className="w-24 h-12 bg-gray-200/90 rounded-2xl"></div>
              </div>
            </div>
          </div>

          {/* Vaccine List Skeleton */}
          <div className="bg-gray-100/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-200 to-gray-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="h-5 bg-gray-300 rounded w-40"></div>
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                  >
                    <div className="flex flex-col h-full animate-pulse">
                      {/* Vaccine Header Skeleton */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-gray-200 rounded-lg sm:rounded-xl">
                          <div className="w-5 h-5 sm:w-6 sm:h-6"></div>
                        </div>
                        <div className="flex flex-col items-end gap-1 sm:gap-2">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Vaccine Name Skeleton */}
                      <div className="h-6 bg-gray-300 rounded mb-2 sm:mb-3"></div>
                      
                      {/* Description Skeleton */}
                      <div className="space-y-2 mb-4 sm:mb-6">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                      
                      {/* Quick Stats Skeleton */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                          </div>
                          <div className="h-5 bg-gray-300 rounded w-8"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 rounded w-16 mb-1"></div>
                            <div className="h-4 bg-gray-300 rounded w-12"></div>
                          </div>
                          
                          <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 rounded w-16 mb-1"></div>
                            <div className="h-4 bg-gray-300 rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Button Skeleton */}
                      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center">
                          <div className="h-8 bg-gray-200 rounded-full w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Banner Skeleton */}
          <div className="mt-6 sm:mt-8 bg-gray-100/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-40 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg sm:rounded-xl w-32"></div>
            </div>
          </div>

          {/* Loading Overlay */}
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-4 border-[#e5989b]/20 border-t-[#e5989b] rounded-full animate-spin"></div>
                <Syringe className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#e5989b] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <div className="px-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Loading Vaccination Database</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-xs sm:max-w-md md:max-w-lg mx-auto">
                  Fetching the latest immunization guidelines and schedules...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] via-white to-[#fceaea] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-100 p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Connection Error</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="group inline-flex items-center bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] via-white to-[#fceaea]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-[#e5989b]/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-[#f8d8d8]/10 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={toggleMobileMenu} />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button onClick={toggleMobileMenu} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter Vaccines</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5" />
              <span>Vaccine Alerts</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              <span>Export List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Epic Header */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-20"></div>
                <div className="relative p-3 sm:p-4 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
                  <Syringe className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Immunization Hub
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2 max-w-2xl">
                  Complete vaccination guide with schedules, dosages, and essential information
                </p>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 border border-gray-200 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#fceaea] rounded-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{vaccines.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 border border-gray-200 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Required</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {vaccines.filter(v => v.is_mandatory).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 border border-gray-200 shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Doses</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {vaccines.reduce((acc, v) => acc + v.doses_needed, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vaccines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]/50 focus:border-transparent text-gray-700 placeholder-gray-500 text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {filteredVaccines.length}
                </span>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                <Bell className="w-4 h-4" />
                Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Vaccine List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5989b]" />
                Vaccine Directory
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  {filteredVaccines.length} vaccines
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {filteredVaccines.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <Syringe className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No matching vaccines</h3>
                <p className="text-sm sm:text-base text-gray-600">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredVaccines.map((vaccine) => (
                  <div
                    key={vaccine.vaccine_option_id}
                    onClick={() => handleVaccineClick(vaccine)}
                    className="group bg-white border border-gray-200 sm:border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl sm:hover:shadow-2xl hover:border-[#e5989b] hover:scale-[1.02] transition-all duration-300 transform active:scale-[0.98]"
                  >
                    <div className="flex flex-col h-full">
                      {/* Vaccine Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                          vaccine.is_mandatory ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <div className={vaccine.is_mandatory ? 'text-red-600' : 'text-blue-600'}>
                            {getVaccineIcon(vaccine.vaccine_name)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 sm:gap-2">
                          {vaccine.is_mandatory ? (
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                              RECOMMENDED
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#e5989b] group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      
                      {/* Vaccine Name */}
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-[#e5989b] transition-colors line-clamp-2">
                        {vaccine.vaccine_name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-3 flex-1">
                        {vaccine.vaccine_description}
                      </p>
                      
                      {/* Quick Stats */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-700">Total Doses</span>
                          </div>
                          <span className="font-bold text-gray-900 text-base sm:text-lg">{vaccine.doses_needed}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="flex flex-col items-center p-2 sm:p-3 bg-[#fceaea] rounded-lg sm:rounded-xl">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#e5989b] mb-1" />
                            <span className="text-xs text-gray-600">First Dose</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {daysToReadableAge(vaccine.schedules[0]?.min_age_days || 0)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-center p-2 sm:p-3 bg-[#f8d8d8] rounded-lg sm:rounded-xl">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#e5989b] mb-1" />
                            <span className="text-xs text-gray-600">Last Dose</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {daysToReadableAge(vaccine.schedules[vaccine.schedules.length - 1]?.max_age_days || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Click Indicator */}
                      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center">
                          <span className="text-xs font-medium text-[#e5989b] bg-[#fceaea] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Banner */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-[#e5989b]/10 via-white to-[#f8d8d8]/10 rounded-xl sm:rounded-2xl border border-[#e5989b]/20 p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-lg sm:rounded-xl flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">Important Medical Disclaimer</h4>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 max-w-3xl">
                  This information is for educational purposes only. Always consult with a qualified healthcare provider 
                  for personalized medical advice. Vaccination schedules may vary based on individual health conditions.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border border-[#e5989b] text-[#e5989b] font-semibold rounded-lg sm:rounded-xl hover:bg-[#e5989b] hover:text-white transition-all duration-300 whitespace-nowrap text-sm sm:text-base self-start md:self-center">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Export List
            </button>
          </div>
        </div>

        {/* Mobile Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden z-30">
          <button className="p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Vaccine Detail Modal */}
      {showDetailModal && selectedVaccine && (
        <VaccineDetailModal
          vaccine={selectedVaccine}
          daysToReadableAge={daysToReadableAge}
          getVaccineIcon={getVaccineIcon}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ImportantVaccines;