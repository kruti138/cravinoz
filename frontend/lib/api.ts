const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function safeFetch(path: string, opts: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    throw new Error("Expected JSON response but received something else. Check if the API URL is correct.");
  } catch (err) {
    // bubble up error to caller
    throw err;
  }
}

const api = {
  getPizzas: () => safeFetch('/api/pizzas'),
  getPizza: (id: string) => safeFetch(`/api/pizzas/${id}`),
  adminLogin: (payload: { email: string; password: string; }) => safeFetch(`/api/auth/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  createPizza: (token: string, payload: any) => safeFetch(`/api/admin/pizzas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }),
  updatePizza: (token: string, id: string, payload: any) => safeFetch(`/api/admin/pizzas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }),
  deletePizza: (token: string, id: string) => safeFetch(`/api/admin/pizzas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }),
  register: (payload: { name: string; email: string; password: string; }) => safeFetch(`/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  verifyEmail: (payload: { email: string; code: string; }) => safeFetch(`/api/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  resendVerification: (payload: { email: string; }) => safeFetch(`/api/auth/resend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string; }) => safeFetch(`/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  createOrder: (token: string, payload: any) => safeFetch(`/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }),
  createRazorpayOrder: (token: string, payload: { amount: number; currency: string }) => 
    safeFetch(`/api/payments/create-order`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify(payload) 
    }),
  verifyRazorpayPayment: (token: string, payload: any) => 
    safeFetch(`/api/payments/verify`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify(payload) 
    }),
  getUserOrders: (token: string) => safeFetch(`/api/orders/user`, { headers: { 'Authorization': `Bearer ${token}` } }),
  getOrderById: (token: string, orderId: string) => safeFetch(`/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
  uploadImage: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return safeFetch(`/api/admin/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
  },
getAdminOrders: (token: string) => safeFetch(`/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
  updateOrderStatus: (token: string, id: string, status: string) => safeFetch(`/api/admin/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) }),
  updatePaymentStatus: (token: string, id: string, paymentStatus: string) => safeFetch(`/api/admin/orders/${id}/payment-status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ paymentStatus }) }),
  getAdminUsers: (token: string) => safeFetch(`/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
  setUserBlock: (token: string, id: string, blocked: boolean) => safeFetch(`/api/admin/users/${id}/block`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ blocked }) }),
};

export default api;
