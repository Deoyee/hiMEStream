import useAuthUser from "../hooks/useAuthUser";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BellIcon, LogOutIcon, ChevronLeft, Menu, X } from "lucide-react";
import useLogOut from "../hooks/useLogOut";
import ThemeSelector from "./ThemeSelector.jsx";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";


const Navbar = () => {

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

  return (
    <>
      <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-end w-full">
          {/* mobile menu button - hidden on chat pages to avoid overlay in chat header */}
          {!isChatPage && (
            <div className="lg:hidden absolute left-2">
              <button
                className="btn btn-ghost btn-circle"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
          {/* back button for mobile (go back to previous page) */}
          {location.pathname !== "/" && (
            <button
              className="btn btn-ghost btn-circle lg:hidden mr-3 absolute left-4"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {/* logo in chat page */}
          {isChatPage && (
            <div className="pl-12 lg:pl-5">
              {/* Use the app logo from public and avoid it acting as a toggle on small screens */}
              <Link to="/" className="flex items-center gap-2 pointer-events-none lg:pointer-events-auto">
                <img src="/logo.png" alt="hiMEStream logo" className="w-9 h-9 object-contain" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  hiMEStream
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <div className="indicator">
                <button className="btn btn-ghost btn-circle">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
                {/* notification badge - show pending incoming friend requests */}
                {friendRequestsCount > 0 && (
                  <span className="indicator-item badge badge-xs badge-primary">{friendRequestsCount}</span>
                )}
              </div>
            </Link>
          </div>

          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-base-200 z-50 shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img src={authUser?.profilePic} alt="Avatar" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">{authUser?.fullName}</p>
                  <Link to="/profile" className="text-xs opacity-70">View profile</Link>
                </div>
              </div>
              <button className="btn btn-ghost btn-circle" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              <Link to="/" className="btn btn-ghost w-full justify-start" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/friends" className="btn btn-ghost w-full justify-start" onClick={() => setMobileOpen(false)}>Friends</Link>
              <Link to="/notifications" className="btn btn-ghost w-full justify-start" onClick={() => setMobileOpen(false)}>Notifications</Link>
              <button className="btn btn-ghost w-full justify-start" onClick={() => { setMobileOpen(false); logoutMutation(); }}>Log out</button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

export default Navbar