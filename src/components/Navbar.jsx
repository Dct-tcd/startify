import { Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden btn btn-ghost text-white/90">
            <Menu size={20} />
          </button>
          <div className="font-semibold tracking-tight">
            <span className="text-white">Ansari Fai</span>
          </div>
        </div>

        <button className="btn btn-primary">Login</button>
      </div>
    </header>
  );
}
