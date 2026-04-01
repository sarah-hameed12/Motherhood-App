// src/pages/MinimalLayout.js
import { Outlet } from "react-router-dom";

const MinimalLayout = () => {
  return (
    <div>
      <Outlet /> {/* Render the Admin Moderation page only */}
    </div>
  );
};

export default MinimalLayout;