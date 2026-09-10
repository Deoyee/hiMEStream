import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, UsersIcon } from "lucide-react";
import Avatar from "./Avatar.jsx";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Friends", path: "/friends", icon: UsersIcon },
    { name: "Notifications", path: "/notifications", icon: BellIcon },
  ];

  return (
    <aside className="w-64 bg-base-200/95 backdrop-blur-md border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]">
          <img src="/logo.png" alt="hiMEStream logo" className="w-9 h-9 object-contain drop-shadow-sm" />
          <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            hiMEStream
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-content shadow-md shadow-primary/20 font-semibold"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
              }`}
            >
              <Icon className={`size-5 ${isActive ? "text-primary-content" : "text-base-content/70"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-base-300/40 border border-base-content/5 hover:border-primary/20 transition-colors">
          <Avatar
            src={authUser?.profilePic}
            name={authUser?.fullName}
            size="md"
            ring={true}
            showOnline={true}
            isOnline={true}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-base-content truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>Online</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;