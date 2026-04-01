import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getRequest, postRequest } from "../api/requests";

interface ModerationReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at?: string;
  post?: {
    id: string;
    title: string;
    description: string;
    visible: boolean;
  };
  reporter?: {
    firstname: string;
    lastname: string;
    username: string;
  };
}

const AdminModeration = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRequest("/community/reports/all");
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleApprove = async (reportId: string) => {
    try {
      await postRequest(`/community/report/${reportId}/moderate/approve`, {});
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to approve post");
    }
  };

  const handleDelete = async (reportId: string) => {
    const reason = window.prompt(
      "Reason for deletion? (spam, harassment, etc)"
    );
    if (!reason) return;

    try {
  const token = localStorage.getItem('token');
  const body = { reason, headers: { 'Authorization': `Bearer ${token}` } };
  
  await postRequest(`/community/report/${reportId}/moderate/delete`, body);
  
  setReports((prev) => prev.filter((r) => r.id !== reportId));
} catch (err: any) {
  alert(err.response?.data?.detail || "Failed to delete post");
}
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading reported posts...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-[#e5989b] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white">Forum Moderation</h1>
        <p className="text-lg text-white/80">
          Logged in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-white/70">No reported posts in the queue.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border rounded-lg bg-white shadow-lg p-6 space-y-4 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Report reason:</strong> {report.reason}
                  </p>
                  {report.description && (
                    <p className="text-sm text-gray-600">
                      <strong>Report description:</strong> {report.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Status:</strong>{" "}
                    <span className="font-semibold">{report.status}</span>
                  </p>
                </div>
                {report.post && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      report.post.visible
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {report.post.visible ? "Visible" : "Hidden"}
                  </span>
                )}
              </div>

              {report.post && (
                <div className="border rounded-md p-4 bg-gray-50 mt-4">
                  <h2 className="font-semibold text-lg text-gray-800 mb-2">
                    {report.post.title}
                  </h2>
                  <p className="text-gray-700">{report.post.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div>
                  {report.reporter && (
                    <p>
                      <strong>Reported by:</strong>{" "}
                      <span className="font-medium">
                        {report.reporter.firstname} {report.reporter.lastname}
                      </span>{" "}
                      (@{report.reporter.username})
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(report.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;