import { Link } from "react-router-dom";
import { X, User, Shield, PlusCircle } from "lucide-react";

const AdminSidebar = () => {
  return (
    <div className="bg-white w-64 h-screen shadow-lg">
      <div className="flex justify-between items-center p-6 bg-[#e5989b] text-white">
        <h2 className="text-lg font-bold">Admin Dashboard</h2>
        <X className="w-6 h-6 cursor-pointer" />
      </div>

      <div className="flex flex-col mt-6 space-y-4 px-6">
        <Link to="/admin/moderation" className="flex items-center space-x-2 text-gray-700 hover:text-[#e5989b]">
          <Shield className="w-5 h-5" />
          <span>Forum Moderation</span>
        </Link>

        <Link to="/admin/users" className="flex items-center space-x-2 text-gray-700 hover:text-[#e5989b]">
          <User className="w-5 h-5" />
          <span>User Management</span>
        </Link>

        <Link to="/admin/vaccines" className="flex items-center space-x-2 text-gray-700 hover:text-[#e5989b]">
          <PlusCircle className="w-5 h-5" />
          <span>Vaccination Management</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;