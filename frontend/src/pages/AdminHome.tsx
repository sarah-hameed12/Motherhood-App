import { useState, useEffect } from "react";
import { 
  Users, 
  Syringe, 
  Heart, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Download,
  UserPlus,
  Target,
  Baby
} from "lucide-react";
import { getRequest } from "../api/requests";

// Types for API responses
interface AdminStatsInfo {
  user_count: number;
  children_count: number;
  vaccination_given: number;
  new_users_count: number;
}

interface AdminDashBoardUserMini {
  id: string;
  fullname: string;
  email: string;
  no_of_children: number;
  account_created_at: string;
}

interface AdminDashboardChilDistribution {
  start_month: number;
  end_montj: number;
  child_count: number;
}

interface UserGrowthData {
  day: string;
  count: number;
}

// Custom date formatter function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to process user growth from account creation dates
const processUserGrowthData = (users: AdminDashBoardUserMini[]): UserGrowthData[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const weeklyData = days.map(day => ({ day, count: 0 }));
  
  users.forEach(user => {
    const createdDate = new Date(user.account_created_at);
    if (createdDate >= startOfWeek && createdDate <= today) {
      const dayIndex = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Mon=0, Sun=6
      if (adjustedIndex >= 0 && adjustedIndex < 7) {
        weeklyData[adjustedIndex].count += 1;
      }
    }
  });
  
  return weeklyData;
};



const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const AdminHome = () => {
  const [dateRange, setDateRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [stats, setStats] = useState<AdminStatsInfo>({
    user_count: 0,
    children_count: 0,
    vaccination_given: 0,
    new_users_count: 0
  });
  
  const [recentUsers, setRecentUsers] = useState<AdminDashBoardUserMini[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AdminDashboardChilDistribution[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsRes, usersRes, ageDistRes] = await Promise.all([
          getRequest('/admin/dashboard/stats'),
          getRequest('/admin/dashboard/users-mini-info'),
          getRequest('/admin/dashboard/child-age-distribution')
        ]);

        setStats(statsRes);
        setRecentUsers(usersRes);
        setAgeDistribution(ageDistRes);
        
        // Process user growth data
        if (usersRes && usersRes.length > 0) {
          const growthData = processUserGrowthData(usersRes);
          setUserGrowth(growthData);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Transform stats data for display
  const statsData = [
    {
      title: "Total Users",
      value: stats.user_count.toLocaleString(),
      change: `+${stats.new_users_count} new`,
      trend: "up",
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Children",
      value: stats.children_count.toLocaleString(),
      change: "+8.1%",
      trend: "up",
      icon: Heart,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "Vaccinations Given",
      value: stats.vaccination_given.toLocaleString(),
      change: "+23.5%",
      trend: "up",
      icon: Syringe,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "New Signups",
      value: stats.new_users_count.toLocaleString(),
      change: "+5.2%",
      trend: "up",
      icon: UserPlus,
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  // Helper function for status badges
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Active</span>;
      case "pending":
        return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium">Pending</span>;
      case "inactive":
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">Inactive</span>;
      default:
        return <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Active</span>;
    }
  };

  // Get avatar initials from fullname
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e5989b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium mb-2">Error loading dashboard</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#e5989b] text-white rounded-lg hover:bg-[#d88a8d] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Welcome and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with Nurtura today</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <button 
                onClick={() => setDateRange("week")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === "week" ? "bg-[#e5989b] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setDateRange("month")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === "month" ? "bg-[#e5989b] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setDateRange("year")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === "year" ? "bg-[#e5989b] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Year
              </button>
            </div>
            
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"} bg-green-50 px-2 py-1 rounded-full`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Recent Users */}
          <div className="space-y-6">
            {/* Recent Users Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
                  <button className="text-sm text-[#e5989b] hover:text-[#d88a8d] font-medium">
                    View All
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {getInitials(user.fullname)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{user.fullname}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.no_of_children}</td>
                        <td className="px-6 py-4">{getStatusBadge("active")}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(user.account_created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Optional: Show relative time for mobile */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 sm:hidden">
                <p className="text-xs text-gray-500">
                  Latest join: {recentUsers.length > 0 ? formatRelativeTime(recentUsers[0].account_created_at) : 'N/A'}
                </p>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">User Growth (This Week)</h2>
                <TrendingUp className="w-5 h-5 text-[#e5989b]" />
              </div>
              
              <div className="flex items-end justify-between h-32 gap-2">
                {userGrowth.map((data) => (
                  <div key={data.day} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-[#e5989b] to-[#d88a8d] rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.max((data.count / 10) * 100, 4)}px` }}
                    ></div>
                    <span className="text-xs text-gray-600">{data.day}</span>
                    <span className="text-xs font-medium text-gray-800">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Child Demographics & Vaccination Analytics */}
          <div className="space-y-6">
            {/* Child Age Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Child Age Distribution</h2>
                  <Baby className="w-5 h-5 text-[#e5989b]" />
                </div>
                <button className="text-sm text-[#e5989b] hover:text-[#d88a8d] font-medium">
                  Details
                </button>
              </div>
              
              <div className="space-y-4">
                {ageDistribution.map((age) => {
                  const totalChildren = ageDistribution.reduce((sum, item) => sum + item.child_count, 0);
                  const percentage = totalChildren > 0 ? Math.round((age.child_count / totalChildren) * 100) : 0;
                  const rangeText = `${age.start_month}-${age.end_montj} months`;
                  
                  return (
                    <div key={rangeText}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {age.start_month === 0 && age.end_montj === 6 ? "0-6 months" :
                           age.start_month === 6 && age.end_montj === 12 ? "6-12 months" :
                           age.start_month === 12 && age.end_montj === 24 ? "1-2 years" :
                           age.start_month === 24 && age.end_montj === 36 ? "2-3 years" :
                           age.start_month === 36 && age.end_montj === 60 ? "3-5 years" : rangeText}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{age.child_count} children</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vaccination Completion Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Vaccination Completion</h2>
                  <Target className="w-5 h-5 text-[#e5989b]" />
                </div>
                <span className="text-2xl font-bold text-gray-800">78%</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-green-600">On Time</span>
                    <span className="font-medium text-gray-700">78%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `78%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-yellow-600">Late</span>
                    <span className="font-medium text-gray-700">15%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `15%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-red-600">Missed</span>
                    <span className="font-medium text-gray-700">7%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `7%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">System Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Server Status</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">API Response</span>
                  <span className="text-sm font-medium">124ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Active Users</span>
                  <span className="text-sm font-medium">{stats.user_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Database Size</span>
                  <span className="text-sm font-medium">2.4 GB</span>
                </div>
              </div>
              
              {/* Last updated timestamp */}
              <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/60">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;