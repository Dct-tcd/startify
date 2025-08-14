export default function PromptHistory() {
  const prompts = [
    "Generate unit test for function X",
    "Find bugs in file Y",
  ];
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Frequently Asked Prompts</h2>
      <ul className="space-y-1">
        {prompts.map((p, i) => (
          <li key={i} className="bg-gray-100 p-2 rounded">{p}</li>
        ))}
      </ul>
    </div>
  );
}
