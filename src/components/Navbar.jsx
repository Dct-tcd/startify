import { Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 bg-gray-700 text-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden btn btn-ghost text-gray-100/90">
            <Menu size={20} />
          </button>
          <div className="font-semibold tracking-tight">
            <span className="text-gray-100">DEVRI-AI</span>
          </div>
        </div>

        <button className="btn btn-primary">Login</button>
      </div>
    </header>
  );
}
