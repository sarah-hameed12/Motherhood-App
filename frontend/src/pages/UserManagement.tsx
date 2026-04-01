import { useState, useEffect } from "react";
import { getRequest, postRequest } from "../api/requests";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getRequest("/admin/users");
        setUsers(data);
      } catch (err: any) {
        // Log the full error for debugging
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please check the network or server.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await postRequest(`/admin/users/${userId}/delete`, {});
      setUsers(users.filter((user: any) => user.id !== userId));
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>User Management</h2>
      <div>
        {users.map((user: any) => (
          <div key={user.id}>
            <span>{user.email}</span>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;