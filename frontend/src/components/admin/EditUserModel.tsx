import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { putRequest } from "../../api/requests";
import type { UserResponseSchema } from "../../pages/AdminManageUsers";
interface Props {
  user: UserResponseSchema | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSuccess: (message: string) => void;
}

const EditUserModal = ({ user, isOpen, onClose, onSuccess, showSuccess }: Props) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await putRequest(`/admin/users/${user.id}`, formData);
      if (!response.error) {
        showSuccess('User updated successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.firstname}
              onChange={(e) => setFormData({...formData, firstname: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e5989b]"
              required
            />
            <input
              type="text"
              value={formData.lastname}
              onChange={(e) => setFormData({...formData, lastname: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e5989b]"
              required
            />
          </div>

          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e5989b]"
            required
          />

          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e5989b]"
            required
          />

          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e5989b]"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
          </select>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#e5989b] text-white rounded-lg hover:bg-[#d88a8d] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;