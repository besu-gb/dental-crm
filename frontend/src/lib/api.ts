// src/lib/api.ts
// Central place for all API calls to the backend
// Change API_URL in .env.local if your backend runs on a different port

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Generic fetch helper — handles errors consistently
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => fetchAPI("/api/dashboard/stats");

// ─── Patients ─────────────────────────────────────────────────────────────────
export const getPatients = (search?: string) =>
  fetchAPI(`/api/patients${search ? `?search=${search}` : ""}`);
export const getPatient = (id: string) => fetchAPI(`/api/patients/${id}`);
export const createPatient = (data: object) =>
  fetchAPI("/api/patients", { method: "POST", body: JSON.stringify(data) });
export const updatePatient = (id: string, data: object) =>
  fetchAPI(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePatient = (id: string) =>
  fetchAPI(`/api/patients/${id}`, { method: "DELETE" });

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getBookings = (status?: string) =>
  fetchAPI(`/api/bookings${status ? `?status=${status}` : ""}`);
export const getBooking = (id: string) => fetchAPI(`/api/bookings/${id}`);
export const createBooking = (data: object) =>
  fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) });
export const updateBooking = (id: string, data: object) =>
  fetchAPI(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBooking = (id: string) =>
  fetchAPI(`/api/bookings/${id}`, { method: "DELETE" });

// ─── Posts ────────────────────────────────────────────────────────────────────
export const getPosts = (status?: string) =>
  fetchAPI(`/api/posts${status ? `?status=${status}` : ""}`);
export const getPost = (id: string) => fetchAPI(`/api/posts/${id}`);
export const createPost = (data: object) =>
  fetchAPI("/api/posts", { method: "POST", body: JSON.stringify(data) });
export const updatePost = (id: string, data: object) =>
  fetchAPI(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePost = (id: string) =>
  fetchAPI(`/api/posts/${id}`, { method: "DELETE" });

// ─── Checkouts ────────────────────────────────────────────────────────────────
export const getCheckouts = () => fetchAPI("/api/checkouts");
export const getCheckout = (id: string) => fetchAPI(`/api/checkouts/${id}`);
export const createCheckout = (data: object) =>
  fetchAPI("/api/checkouts", { method: "POST", body: JSON.stringify(data) });
export const updateCheckout = (id: string, data: object) =>
  fetchAPI(`/api/checkouts/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const sendCheckoutEmail = (id: string) =>
  fetchAPI(`/api/checkouts/${id}/send-email`, { method: "POST" });
export const deleteCheckout = (id: string) =>
  fetchAPI(`/api/checkouts/${id}`, { method: "DELETE" });

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const getContacts = () => fetchAPI("/api/contacts");
export const getContact = (id: string) => fetchAPI(`/api/contacts/${id}`);
export const createContact = (data: object) =>
  fetchAPI("/api/contacts", { method: "POST", body: JSON.stringify(data) });
export const updateContact = (id: string, data: object) =>
  fetchAPI(`/api/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteContact = (id: string) =>
  fetchAPI(`/api/contacts/${id}`, { method: "DELETE" });
