import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
