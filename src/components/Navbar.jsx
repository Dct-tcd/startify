import { Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 bg-gray-700 text-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden btn btn-ghost text-gray-100/90">
            <Menu size={20} />
          </button>
          {/* <div className="font-semibold tracking-tight">
            <span className="text-gray-100">DEVRI-AI</span>
          </div> */}

          <svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
<circle cx="25" cy="30" r="22" fill="#0284C7"/>
<text x="25" y="35" font-size="22" text-anchor="middle" fill="white">🧠</text>

<text x="50" y="38" font-size="24" font-family="Arial, sans-serif" font-weight="bold" fill="#f1ececff">
CodeMentor <tspan fill="#0284C7">AI</tspan>
</text>
</svg>

        </div>

        <button className="btn btn-primary">Login</button>
      </div>
    </header>
  );
}
