import { useState, useEffect } from "react";
import {
  MessageCircle,
  Loader2,
  AlertCircle,
  Flag,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  X,
  Calendar,
} from "lucide-react";
import { getRequest, putRequest, deleteRequest } from "../api/requests";

interface ReportAuthor {
  firstname: string;
  lastname: string;
  username: string;
  profile_pic: string;
}

interface PostAuthor {
  firstname: string;
  lastname: string;
  username: string;
  profile_pic: string;
}

interface Post {
  user_id: string;
  user: PostAuthor;
  title: string;
  tags: string[];
  images: string[];
  description: string;
  post_type: string;
  id: string;
  visible: boolean;
  post_category: string;
  like_count: number;
  created_at: string;
  likers: string[];
}

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: "Pending" | "Resolved" | "Rejected";
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  reporter: ReportAuthor;
  post: Post;
}

const ManageCommunity = () => {
  const [activeTab, setActiveTab] = useState<"reports" | "members">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedReports, setExpandedReports] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Resolved" | "Rejected">("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"Pending" | "Resolved" | "Rejected">("Pending");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch reports on mount
  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else {
    }
  }, [activeTab]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getRequest("/community/reports/all");
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

 

  const handleUpdateStatus = async (reportId: string, status: string) => {
    setUpdatingReportId(reportId);
    try {
      await putRequest(`/community/report/${reportId}`, {
        status: status,
        admin_notes: adminNotes,
      });
      setSuccessMessage(`Report status updated to ${status}!`);
      setIsDetailModalOpen(false);
      setAdminNotes("");
      fetchReports();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating report:", err);
      setError("Failed to update report status.");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteRequest(`/community/report/${reportId}`);
        setSuccessMessage("Report deleted successfully!");
        fetchReports();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting report:", err);
        setError("Failed to delete report.");
      }
    }
  };

  const toggleReportExpand = (reportId: string) => {
    setExpandedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const openDetailModal = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.admin_notes || "");
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;
    const matchesSearch =
      report.reporter.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Manage Community
              </h1>
            </div>
            <p className="text-gray-600">Moderate posts, manage reports, and view community members</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-[#e5989b]/20">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "reports"
                ? "border-[#e5989b] text-[#e5989b]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Reported Posts
            </div>
          </button>
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reporter or post title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none"
                />
              </div>

              <div className="flex gap-2">
                {["All", "Pending", "Resolved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      statusFilter === status
                        ? "bg-[#e5989b] text-white"
                        : "bg-white border border-[#e5989b]/20 text-gray-700 hover:bg-[#fceaea]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                  <Loader2 className="w-8 h-8 text-[#e5989b] animate-spin mb-3" />
                  <p className="text-gray-600 font-medium">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <Flag className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    No reports found
                  </h3>
                  <p className="text-gray-600">All clear! No community reports to review.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Report Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Reporter Avatar */}
                          <img
                            src={
                              report.reporter.profile_pic ||
                              `https://ui-avatars.com/api/?name=${report.reporter.firstname}`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />

                          {/* Report Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                @{report.reporter.username}
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(report.status)}`}>
                                {getStatusIcon(report.status)}
                                {report.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Reported for: <span className="font-semibold">{report.reason}</span>
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Post Preview */}
                        <div className="flex items-center gap-2 ml-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {report.post.post_type}
                          </span>
                        </div>
                      </div>

                      {/* Reported Post Title */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-xs text-gray-600 mb-1">Reported Post:</p>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {report.post.title}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(report)}
                          className="flex-1 px-4 py-2 bg-[#e5989b] text-white rounded-lg hover:bg-[#d88a8d] transition-colors font-medium text-sm"
                        >
                          Review & Update
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <button
                      onClick={() => toggleReportExpand(report.id)}
                      className="w-full p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                    >
                      Show Details
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedReports.includes(report.id) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedReports.includes(report.id) && (
                      <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200 space-y-4">
                        {/* Report Description */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                            Report Description
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {report.description}
                          </p>
                        </div>

                        {/* Reported Post */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                            Full Reported Post
                          </h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={
                                  report.post.user.profile_pic ||
                                  `https://ui-avatars.com/api/?name=${report.post.user.firstname}`
                                }
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {report.post.user.firstname} {report.post.user.lastname}
                                </p>
                                <p className="text-xs text-gray-500">
                                  @{report.post.user.username}
                                </p>
                              </div>
                            </div>
                            <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                              {report.post.title}
                            </h5>
                            <p className="text-gray-700 text-sm mb-3">
                              {report.post.description}
                            </p>
                            {report.post.images && report.post.images.length > 0 && (
                              <img
                                src={report.post.images[0]}
                                alt="Post image"
                                className="w-full rounded-lg object-cover max-h-48"
                              />
                            )}
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {report.admin_notes && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                              Admin Notes
                            </h4>
                            <p className="text-gray-700 text-sm bg-white p-3 rounded-lg border border-gray-200">
                              {report.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedReport && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60]"
            onClick={() => setIsDetailModalOpen(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white via-[#fff6f6] to-[#fceaea] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5989b]/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#e5989b]/20 sticky top-0 bg-gradient-to-r from-[#fff6f6] to-[#fceaea]">
                <h2 className="text-2xl font-bold text-gray-900">Review Report</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 hover:bg-[#fceaea] rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-[#e5989b]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Report Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Report Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                    rows={4}
                    className="w-full px-4 py-3 border border-[#e5989b]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#e5989b]/40 focus:border-[#e5989b] outline-none resize-none"
                  />
                </div>

                {/* Report Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium ml-2">{selectedReport.reason}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Reporter:</span>
                      <span className="font-medium ml-2">
                        @{selectedReport.reporter.username}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Reported Post:</span>
                      <span className="font-medium ml-2">{selectedReport.post.title}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#e5989b]/20">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-[#e5989b]/30 text-[#e5989b] rounded-lg hover:bg-[#fceaea] transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, newStatus)}
                    disabled={updatingReportId === selectedReport.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50"
                  >
                    {updatingReportId === selectedReport.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageCommunity;