// Local: http://localhost:8000   |   Deployed: set VITE_API_URL on Netlify to your backend URL
const ROOT = import.meta.env.VITE_API_URL || "http://localhost:8000";
const BASE = `${ROOT}/api`;

async function handle(res) {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      msg = (await res.json()).detail || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getHealth = () => fetch(`${BASE}/health`).then(handle);

export const getDefaultDoc = () => fetch(`${BASE}/default-doc`).then(handle);

export const askAssistant = (message, doc_id) =>
  fetch(`${BASE}/assistant`, json("POST", { message, doc_id })).then(handle);

export const bookFlight = (flight_id, name, age) =>
  fetch(`${BASE}/book`, json("POST", { flight_id, name, age })).then(handle);

export const getBookings = () => fetch(`${BASE}/bookings`).then(handle);

export const cancelBooking = (pnr) =>
  fetch(`${BASE}/bookings/${pnr}`, { method: "DELETE" }).then(handle);

export const getRefund = (pnr) =>
  fetch(`${BASE}/bookings/${pnr}/refund`).then(handle);

export const uploadPolicy = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${BASE}/upload`, { method: "POST", body: fd }).then(handle);
};
