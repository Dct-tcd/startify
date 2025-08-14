import { useState } from "react";
import TabSwitcher from "../components/TabSwitcher";

export default function TestCaseGen() {
  const [activeTab, setActiveTab] = useState("Manual");

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Test Case Generation</h1>
      <TabSwitcher
        tabs={["Manual", "Automation"]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="mt-4">
        {activeTab === "Manual" && <div>Manual Test Case Form</div>}
        {activeTab === "Automation" && <div>Automation Test Case Generator</div>}
      </div>
    </div>
  );
}
