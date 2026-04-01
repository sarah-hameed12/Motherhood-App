import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GuestRoute from "./middleware/guestRoutes";
import ProtectedRoutes from "./middleware/protectRoutes";
import DashboardLayout from "./pages/DashboardLayout";
import Home from "./pages/Home";
import MyChildren from "./pages/Children";
import Vaccinations from "./pages/Vaccinations";
import Immunizations from "./pages/Immunizations";
import Community from "./pages/Community";
// import AddChild from "./pages/AddChild";
import UserProfile from "./pages/UserProfile";
import AddVaccination from "./pages/AddVaccination";
import Settings from "./pages/Settings";
import ImportantVaccines from "./pages/ImportantVaccines";
import ChildGrowthTracking from "./pages/ChildGrowthTracking";
import AdminHome from "./pages/AdminHome";
import AdminManageUsers from "./pages/AdminManageUsers";
import ManageVaccinations from "./pages/ManageVaccinations";
import ManageCommunity from "./pages/ManageCommunity";
import TutorialsPage from "./pages/TutorialsPage";
import TutorialDetailPage from "./pages/TutorialDetailPage";
import SocketTest from "./components/Sockettest";
function App() {
  return (
    <Routes>
      {/* ================= GUEST ROUTES ================= */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
<Route path="/socket-test" element={<SocketTest />} />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />

      {/* ================ PROTECTED ROUTES ================ */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminHome />} />
          <Route path="/admin/manage/users" element={<AdminManageUsers />} />
          <Route path="/admin/manage-vaccinations" element={<ManageVaccinations />} />
          <Route path="/admin/manage-community" element={<ManageCommunity />} />

          <Route path="/" element={<Home />} />

          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tutorials/:id" element={<TutorialDetailPage />} />

          <Route path="/children" element={<MyChildren />} />
          {/* <Route path="/add-child" element={<AddChild />} /> */}
          <Route path='profile' element={<UserProfile />} />
          <Route path="/immunizations" element={<Immunizations />} />
          <Route path="/vaccinations" element={<Vaccinations />} />
          <Route path="/add-vaccination" element={<AddVaccination />} />
          <Route path="/important-vaccines" element={<ImportantVaccines />} />

          <Route path="/community" element={<Community />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/mother/:id" element={<UserProfile />} />

          <Route path="/child/:childId/growth" element={<ChildGrowthTracking />} />

        
        </Route>
      </Route>
    </Routes>
  );
}

export default App;