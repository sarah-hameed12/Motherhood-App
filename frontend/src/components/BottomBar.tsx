// import { Link, useLocation } from "react-router-dom";
// import { 
//   Home, 
//   Users, 
//   Calendar, 
//   MessageCircle,
//   Plus
// } from "lucide-react";

// const BottomBar = () => {
//   const location = useLocation();

//   const navigationItems = [
//     { path: "/", icon: Home, label: "Dashboard" },
//     { path: "/children", icon: Users, label: "Children" },
//     { path: "/add-child", icon: Plus, label: "Add Child" },
//     { path: "/vaccinations", icon: Calendar, label: "Vaccines" },
//     { path: "/community", icon: MessageCircle, label: "Community" },
//   ];

//   const isActive = (path: string) => {
//     return location.pathname === path;
//   };

//   return (
//     <div className="bg-white border-t border-gray-200 py-3 px-4">
//       <div className="flex justify-around items-center">
//         {navigationItems.map((item) => {
//           const Icon = item.icon;
//           const active = isActive(item.path);
          
//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative group ${
//                 active 
//                   ? "text-[#e5989b]" 
//                   : "text-gray-500 hover:text-[#e5989b]"
//               }`}
//             >
//               <Icon className="w-6 h-6" />
//               {/* Hidden label that appears on hover (bottom version) */}
//               <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 mb-2">
//                 {item.label}
//                 {/* Tooltip arrow */}
//                 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-b-gray-800"></div>
//               </span>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default BottomBar;




import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  MessageCircle,
  Plus,
  PlayCircle,
} from "lucide-react";

const BottomBar = () => {
  const location = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/children", icon: Users, label: "Children" },
    { path: "/add-child", icon: Plus, label: "Add Child" },
    { path: "/tutorials", icon: PlayCircle, label: "Tutorials" },
    { path: "/vaccinations", icon: Calendar, label: "Vaccines" },
    { path: "/community", icon: MessageCircle, label: "Community" },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path === "/" ? "/__never__" : path)
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 py-3 px-4">
      <div className="flex justify-around items-center">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative group ${
                active
                  ? "text-[#e5989b]"
                  : "text-gray-500 hover:text-[#e5989b]"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 mb-2">
                {item.label}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-b-gray-800"></div>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;