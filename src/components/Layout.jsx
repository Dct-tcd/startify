import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Page content (push right to make room for sidebar on md+) */}
      <div className="md:pl-64">
        <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        <div className="mx-auto max-w-7xl p-4 sm:p-1 lg:p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
