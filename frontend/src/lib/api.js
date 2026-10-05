const API_BASE = import.meta.env.VITE_API_URL || "";

async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

export async function getHealth() {
  return parse(await fetch(`${API_BASE}/api/health`));
}

export async function uploadPdf(file) {
  const form = new FormData();
  form.append("file", file);

  return parse(
    await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: form,
    }),
  );
}

export async function askQuestion(docId, question) {
  return parse(
    await fetch(`${API_BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, question }),
    }),
  );
}
