import { Link } from "react-router-dom";
import { Bug, CheckSquare, FileCode2, Database, Settings, History, MoveRight, ShieldCheck, LucideUpload } from "lucide-react";
import Card from "../components/Card";

const tools = [
  { to: "/test-case-gen", title: "Test Case Generation", subtitle: "Manual → automation in one click", icon: <CheckSquare size={20}/> },
  { to: "/bug-fixer", title: "Bug Finder & Fixer", subtitle: "Scan code, suggest fixes", icon: <Bug size={20}/> },
  // { to: "/automation-writer", title: "Automation Test Case Writer", subtitle: "Generate E2E tests", icon: <Wand2 size={20}/> },
  { to: "/test-data", title: "Test Data Generation", subtitle: "Synthetic & masked data", icon: <Database size={20}/> },
  { to: "/code-migration", title: "Code Migration", subtitle: "Framework/language moves", icon: <MoveRight size={20}/> },
  { to: "/code-optimisation", title: "Code Optimisation", subtitle: "Refactor & improve", icon: <ShieldCheck size={20}/> },
  { to: "/code-review", title: "Code Review", subtitle: "AI suggestions & diff notes", icon: <FileCode2 size={20}/> },
  { to: "/prompts", title: "Prompt History", subtitle: "Frequently used prompts", icon: <History size={20}/> },  
  { to: "/file-test-gen", title: "File-feature test gen", subtitle: "Generate test cases from file", icon: <LucideUpload size={20}/> },

];

export default function HomePage() {
  return (
    <>
      <div className="mb-2">
        <h1 className="text-gray-100">DEVRI-AI Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Pick a tool to start. You can collapse the sidebar on mobile with the menu button.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t) => (
          <Card
            key={t.to}
            title={t.title}
            subtitle={t.subtitle}
            icon={t.icon}
            to={t.to}
            LinkComp={Link}
          />
        ))}
      </div>
    </>
  );
}
