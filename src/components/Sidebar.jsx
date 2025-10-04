import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bug, CheckSquare, FileCode2, Database, Settings, History, Wand2,
  MoveRight, ShieldCheck, PanelsTopLeft, Users
} from "lucide-react";

// Full developer links
const developerLinks = [
  { to: "/", label: "Dashboard", icon: PanelsTopLeft },
  { to: "/bug-fixer", label: "Bug Finder & Fixer", icon: Bug },
  { to: "/code-migration", label: "Code Migration", icon: MoveRight },
  { to: "/code-optimisation", label: "Code Optimisation", icon: ShieldCheck },
  { to: "/code-review", label: "Code Review", icon: FileCode2 },
  { to: "/prompts", label: "Prompt History", icon: History },
  // { to: "/settings", label: "Integrations", icon: Settings },
];

// Tester-focused links only
const testerLinks = [
  { to: "/", label: "Dashboard", icon: PanelsTopLeft },
  { to: "/test-case-gen", label: "Test Case Gen", icon: CheckSquare },
  { to: "/test-data", label: "Test Data Gen", icon: Database },
    { to: "/file-test-gen", label: "File Test Data Gen", icon: Wand2 },
];

export default function Sidebar({ open, onClose }) {
  const [mode, setMode] = useState("developer");

  const links = mode === "tester" ? developerLinks : testerLinks;

  const toggleMode = () => {
    setMode(prev => (prev === "developer" ? "tester" : "developer"));
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header with toggle */}
        <div className="h-14 border-b border-gray-800 px-4 flex items-center justify-between text-gray-100 font-semibold">
          <span>
        {mode === "developer" ? "Tester Tools" : "Developer Tools"}
      </span>
          <button
            onClick={toggleMode}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <Users size={14} />
            {mode === "developer" ? "Develop" : "Test"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-3 space-y-1 overflow-y-auto h-[calc(100vh-56px)]">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
