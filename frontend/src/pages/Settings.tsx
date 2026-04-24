import { useState } from "react";
import { Lock, Trash2, AlertTriangle, CheckCircle, Key, Shield, Heart } from "lucide-react";
import { postRequest, deleteRequest } from "../api/requests";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    new_password: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Delete Account State
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Password Reset Handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.new_password !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (passwordForm.password === passwordForm.new_password) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const requestData = {
        password: passwordForm.password,
        new_password: passwordForm.new_password,
      };

      await postRequest("/auth/password-reset", requestData);
      
      setShowPasswordSuccess(true);
      
      setPasswordForm({
        password: "",
        new_password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err: any) {
      console.error("Password reset failed:", err);
      if (err.response?.data?.detail === "Password is incorrect!") {
        setPasswordError("Current password is incorrect");
      } else if (err.response?.data?.detail === "User not found!") {
        setPasswordError("User session expired. Please log in again.");
      } else {
        setPasswordError(err.response?.data?.detail || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteRequest("/user-profile/delete");
      
      setShowDeleteConfirmation(false);
      setShowDeleteSuccess(true);
      
      setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      console.error("Account deletion failed:", err);
      setDeleteError(err.response?.data?.detail || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteError("");
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] via-white to-[#fceaea] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-2xl shadow-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500">Manage your account security and preferences</p>
          </div>

          {/* Reset Password Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e5989b]/10 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#e5989b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {passwordError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{passwordError}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword.current ? "text" : "password"}
                      name="password"
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      className="w-full pl-12 pr-24 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50"
                      placeholder="Enter current password"
                      required
                      disabled={isPasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-[#e5989b] transition-colors"
                    >
                      {showPassword.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-12 pr-24 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50"
                      placeholder="Enter new password"
                      required
                      disabled={isPasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-[#e5989b] transition-colors"
                    >
                      {showPassword.new ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-12 pr-24 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] transition-all duration-200 bg-gray-50"
                      placeholder="Re-enter new password"
                      required
                      disabled={isPasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-[#e5989b] transition-colors"
                    >
                      {showPassword.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="w-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPasswordLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    "Save New Password"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-white px-6 py-5 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900">Delete Account</h2>
                  <p className="text-sm text-red-600">Permanently remove your account and all data</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-white rounded-xl p-5 mb-6 border border-red-100">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 text-sm mb-3">
                      Once you delete your account, there is no going back. This action is permanent and will:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start text-sm text-gray-600">
                        <span className="text-red-500 mr-2">•</span>
                        Permanently delete your profile and all personal information
                      </li>
                      <li className="flex items-start text-sm text-gray-600">
                        <span className="text-red-500 mr-2">•</span>
                        Remove all your posts, comments, and community activity
                      </li>
                      <li className="flex items-start text-sm text-gray-600">
                        <span className="text-red-500 mr-2">•</span>
                        Delete all children profiles and their data
                      </li>
                      <li className="flex items-start text-sm text-gray-600">
                        <span className="text-red-500 mr-2">•</span>
                        Remove all vaccination records and reminders
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete My Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Success Popup */}
      {showPasswordSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-center mb-6">
                Your password has been reset successfully. Redirecting to home...
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Popup */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Deleted</h3>
              <p className="text-gray-600 text-center mb-6">
                Your account has been permanently deleted. Redirecting to login...
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Are you sure you want to permanently delete your account?
              </h3>
              <p className="text-gray-600 text-center mb-2">
                This action will delete your account permanently and cannot be undone.
              </p>
              <p className="text-red-600 font-semibold text-center">
                All your data will be lost forever.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-medium text-sm text-center">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;