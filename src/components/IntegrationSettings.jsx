export default function IntegrationSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Integrations</h2>
      <div>
        <label className="block">Jira API Key</label>
        <input type="text" className="border p-2 w-full" placeholder="Enter Jira key"/>
      </div>
      <div>
        <label className="block">GitHub Token</label>
        <input type="text" className="border p-2 w-full" placeholder="Enter GitHub token"/>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
    </div>
  );
}
