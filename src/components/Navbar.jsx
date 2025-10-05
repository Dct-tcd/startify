import { Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 bg-gray-800 text-gray-100 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left section: logo + menu */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-700 transition"
          >
            <Menu size={20} className="text-gray-100" />
          </button>

          {/* Logo */}
          <div className="font-bold text-lg tracking-tight text-gray-100">
            DEVRI-AI
          </div>
        </div>

        {/* Right section: login button */}
        <div>
          <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium text-white transition">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
