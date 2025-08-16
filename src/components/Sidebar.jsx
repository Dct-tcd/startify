import { NavLink } from "react-router-dom";
import {
  Bug, CheckSquare, FileCode2, Database, Settings, History, Wand2,
  MoveRight, ShieldCheck, PanelsTopLeft
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: PanelsTopLeft },
  { to: "/test-case-gen", label: "Test Case Gen", icon: CheckSquare },
  { to: "/bug-fixer", label: "Bug Finder & Fixer", icon: Bug },
  // { to: "/automation-writer", label: "Automation Writer", icon: Wand2 },
  { to: "/test-data", label: "Test Data Gen", icon: Database },
  { to: "/code-migration", label: "Code Migration", icon: MoveRight },
  { to: "/code-optimisation", label: "Code Optimisation", icon: ShieldCheck },
  { to: "/code-review", label: "Code Review", icon: FileCode2 },
  { to: "/prompts", label: "Prompt History", icon: History },
  { to: "/settings", label: "Integrations", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

        <div className="h-14 border-b border-gray-800 px-4 flex items-center text-gray-100 font-semibold">
          Tools
        </div>

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
