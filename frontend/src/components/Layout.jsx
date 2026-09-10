import { useLocation } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  return (
    <div className="h-screen w-full bg-base-100 flex flex-col overflow-hidden">
      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          <Navbar showSidebar={showSidebar} />

          <main
            className={`flex-1 min-h-0 bg-base-100 ${
              isChatPage ? "h-full overflow-hidden flex flex-col p-0 m-0" : "overflow-y-auto"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;

