import useAuthUser from "../hooks/useAuthUser";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BellIcon, LogOutIcon, ChevronLeft, Menu, X, HomeIcon, UsersIcon, UserIcon } from "lucide-react";
import useLogOut from "../hooks/useLogOut";
import ThemeSelector from "./ThemeSelector.jsx";
import Avatar from "./Avatar.jsx";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Navbar = ({ showSidebar = false }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  // fetch notifications (friend requests)
  const { data: friendRequestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    retry: false,
  });

  const friendRequestsCount = friendRequestsData?.incomingReqs?.length || 0;
  const { logoutMutation } = useLogOut();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Friends", path: "/friends", icon: UsersIcon },
    { name: "Notifications", path: "/notifications", icon: BellIcon, badge: friendRequestsCount },
    { name: "Edit Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <>
      <nav className="bg-base-200/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-30 h-16 flex items-center overflow-visible">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between w-full">
          {/* Left section: Cleanly handle Back button / Menu and Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {location.pathname !== "/" ? (
              <button
                className="btn btn-ghost btn-circle btn-sm lg:hidden"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-circle btn-sm lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </button>
            )}

            {/* Brand Logo: Hidden on desktop when Sidebar is visible, shown on mobile or when no Sidebar exists */}
            <Link
              to="/"
              className={`items-center gap-2 flex-shrink-0 ${
                showSidebar ? "flex lg:hidden" : "flex"
              }`}
            >
              <img src="/logo.png" alt="hiMEStream logo" className="w-7 h-7 object-contain" />
              <span
                className={`${
                  isChatPage ? "hidden sm:inline-block" : "inline-block"
                } text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider`}
              >
                hiMEStream
              </span>
            </Link>
          </div>

          {/* Right side controls grouped together */}
          <div className="flex items-center gap-1.5 sm:gap-3 ml-auto flex-shrink-0">
            {/* On mobile chat page, hide bell so controls stay clean and spacious */}
            <Link
              to="/notifications"
              className={`${
                isChatPage ? "hidden sm:inline-flex" : "inline-flex"
              } btn btn-ghost btn-circle btn-sm sm:btn-md`}
              aria-label="Notifications"
            >
              <div className="indicator">
                <BellIcon className="size-5 text-base-content/80" />
                {friendRequestsCount > 0 && (
                  <span className="indicator-item badge badge-xs badge-primary animate-pulse">
                    {friendRequestsCount}
                  </span>
                )}
              </div>
            </Link>

            <ThemeSelector />

            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 pl-1.5 border-l border-base-content/10 hover:opacity-85 transition-opacity"
              title="Edit Profile"
            >
              <Avatar
                src={authUser?.profilePic}
                name={authUser?.fullName}
                size="sm"
                ring={true}
                showOnline={true}
                isOnline={true}
              />
              <span className="hidden md:inline-block text-sm font-medium text-base-content/90 truncate max-w-[130px]">
                {authUser?.fullName}
              </span>
            </Link>

            <div
              className="flex sm:hidden items-center pl-1.5 border-l border-base-content/10 cursor-pointer"
              onClick={() => setMobileOpen(true)}
              title="Open menu"
            >
              <Avatar
                src={authUser?.profilePic}
                name={authUser?.fullName}
                size="sm"
                ring={true}
                showOnline={true}
                isOnline={true}
              />
            </div>

            {/* Logout button (desktop only) */}
            <button
              className="hidden sm:flex btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-error transition-colors"
              onClick={logoutMutation}
              title="Log out"
              aria-label="Log out"
            >
              <LogOutIcon className="size-5" />
            </button>
          </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-base-200 z-50 shadow-2xl p-5 flex flex-col justify-between border-r border-base-300">
            <div>
              {/* Drawer Header: Brand Logo & Close button */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-base-300">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img src="/logo.png" alt="hiMEStream logo" className="w-8 h-8 object-contain" />
                  <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                    hiMEStream
                  </span>
                </Link>

                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* User Profile Card */}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="p-3.5 rounded-2xl bg-base-300/60 hover:bg-base-300 border border-base-content/10 mb-5 flex items-center gap-3 transition-colors group cursor-pointer"
                title="Edit Profile"
              >
                <Avatar
                  src={authUser?.profilePic}
                  name={authUser?.fullName}
                  size="md"
                  ring={true}
                  showOnline={true}
                  isOnline={true}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-base-content group-hover:text-primary transition-colors truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    Edit Profile
                  </p>
                </div>
              </Link>

              {/* Navigation Items with Icons & Active State */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-content shadow-md shadow-primary/20 font-semibold"
                          : "text-base-content/75 hover:text-base-content hover:bg-base-300/60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className={`size-5 ${isActive ? "text-primary-content" : "text-base-content/70"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="badge badge-xs badge-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer: Logout */}
            <div className="pt-4 border-t border-base-300 space-y-2">
              <button
                className="btn btn-ghost w-full justify-start text-error hover:bg-error/10 rounded-xl gap-3 text-sm font-medium"
                onClick={() => {
                  setMobileOpen(false);
                  logoutMutation();
                }}
              >
                <LogOutIcon className="size-5" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;