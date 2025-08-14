export default function TabSwitcher({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-2 border-b border-gray-300">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
