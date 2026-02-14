const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function safeFetch(path: string, opts: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    // bubble up error to caller; callers may fallback to mock data
    throw err;
  }
}

export async function getPizzas() {
  return safeFetch('/api/pizzas');
}

export async function getPizza(id: string) {
  return safeFetch(`/api/pizzas/${id}`);
}

export async function adminLogin(payload: { email: string; password: string; }) {
  return safeFetch(`/api/auth/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function createPizza(token: string, payload: any) {
  return safeFetch(`/api/admin/pizzas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function updatePizza(token: string, id: string, payload: any) {
  return safeFetch(`/api/admin/pizzas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function deletePizza(token: string, id: string) {
  return safeFetch(`/api/admin/pizzas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
}

export async function register(payload: { name: string; email: string; password: string; }) {
  return safeFetch(`/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function verifyEmail(payload: { email: string; code: string; }) {
  return safeFetch(`/api/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function resendVerification(payload: { email: string; }) {
  return safeFetch(`/api/auth/resend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function login(payload: { email: string; password: string; }) {
  return safeFetch(`/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function createOrder(token: string, payload: any) {
  return safeFetch(`/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function getUserOrders(token: string) {
  return safeFetch(`/api/orders/user`, { headers: { 'Authorization': `Bearer ${token}` } });
}

// Get single order for real-time updates
export async function getOrderById(token: string, orderId: string) {
  return safeFetch(`/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } });
}

export async function uploadImage(token: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  return safeFetch(`/api/admin/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
}

// Admin order & user APIs
export async function getAdminOrders(token: string) {
  return safeFetch(`/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
}

export async function updateOrderStatus(token: string, id: string, status: string) {
  return safeFetch(`/api/admin/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
}

export async function getAdminUsers(token: string) {
  return safeFetch(`/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
}

export async function setUserBlock(token: string, id: string, blocked: boolean) {
  return safeFetch(`/api/admin/users/${id}/block`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ blocked }) });
}

export default { getPizzas, getPizza, register, verifyEmail, resendVerification, login, createOrder, getUserOrders, getOrderById, adminLogin, createPizza, updatePizza, deletePizza, uploadImage, getAdminOrders, updateOrderStatus, getAdminUsers, setUserBlock };
