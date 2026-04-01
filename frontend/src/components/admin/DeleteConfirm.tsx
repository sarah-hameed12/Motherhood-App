import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { deleteRequest } from "../../api/requests";

import type { UserResponseSchema } from "../../pages/AdminManageUsers";


interface Props {
  user: UserResponseSchema | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSuccess: (message: string) => void;
}

const DeleteConfirmModal = ({ user, isOpen, onClose, onSuccess, showSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
  setLoading(true);
  try {
    const response = await deleteRequest("/user-profile/delete");
    if (!response?.error) {
      showSuccess("User deleted successfully");
      onSuccess();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Delete User</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-medium text-gray-800">
              {user.firstname} {user.lastname}
            </span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;