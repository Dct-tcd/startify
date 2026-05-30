const STORAGE_KEY = "promptHistory";

export function loadLocalHistory() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePromptHistory(entry) {
  const history = loadLocalHistory();
  const nextEntry = {
    id: entry.id ?? Date.now(),
    type: entry.type ?? "Prompt",
    input: entry.input ?? "",
    output: entry.output ?? "",
    timestamp: entry.timestamp ?? new Date().toLocaleString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([nextEntry, ...history]));
  return nextEntry;
}

export function clearLocalHistory() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
