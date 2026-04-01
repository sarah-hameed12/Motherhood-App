import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { getRequest } from "../api/requests";
import UserTable from "../components/admin/UserTable";
import AddUserModal from "../components/admin/AddUserModel";
import EditUserModal from "../components/admin/EditUserModel";
import DeleteConfirmModal from "../components/admin/DeleteConfirm";

// Types
export interface UserResponseSchema {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  profile_pic?: string | null;
  role: string;
  account_created_at?: string;
  no_of_children?: number;
}

const AdminManageUsers = () => {
  const [users, setUsers] = useState<UserResponseSchema[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserResponseSchema | null>(null);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const usersPerPage = 10;

  // Fetch users
const fetchUsers = async () => {
  setLoading(true);
  try {
    const usersList = await getRequest("/auth/users");
    setUsers(usersList);
    setFilteredUsers(usersList);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);

  // Filter users
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, users]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handlers
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (user: UserResponseSchema) => {
    setSelectedUser(user);
    setModalState({ ...modalState, edit: true });
  };

  const handleDelete = (user: UserResponseSchema) => {
    setSelectedUser(user);
    setModalState({ ...modalState, delete: true });
  };

  const handleAdd = () => {
    setModalState({ ...modalState, add: true });
  };

  const closeModals = () => {
    setModalState({ add: false, edit: false, delete: false });
    setSelectedUser(null);
  };

  const refreshUsers = async () => {
    await fetchUsers();
    closeModals();
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e5989b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-gray-600 mt-1">
              Total {filteredUsers.length} users
              {filteredUsers.length !== users.length && ` (filtered from ${users.length})`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#e5989b] text-white rounded-lg hover:bg-[#d88a8d] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b]"
              />
            </div>
            
            <div className="sm:w-48 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b] bg-white"
              >
                <option value="all">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
                <option value="MODERATOR">Moderators</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UserTable
          users={currentUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Empty State */}
        {currentUsers.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first user to get started'}
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="text-[#e5989b] hover:text-[#d88a8d] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={modalState.add}
        onClose={closeModals}
        onSuccess={refreshUsers}
        showSuccess={showSuccess}
      />

      <EditUserModal
        user={selectedUser}
        isOpen={modalState.edit}
        onClose={closeModals}
        onSuccess={refreshUsers}
        showSuccess={showSuccess}
      />

      <DeleteConfirmModal
        user={selectedUser}
        isOpen={modalState.delete}
        onClose={closeModals}
        onSuccess={refreshUsers}
        showSuccess={showSuccess}
      />
    </div>
  );
};

export default AdminManageUsers;