'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPizzasPage() {
  const auth = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ name: '', description: '', image: '', category: 'veg', basePrice: 0, sizes: { small: 0, medium: 0, large: 0 }, toppings: [], popular: false, available: true });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Try to get token from AuthProvider first, then fallback to admin_token in localStorage
    const adminToken = localStorage.getItem('admin_token');
    const authToken = auth?.token;
    setToken(authToken || adminToken);
    fetchPizzas();
  }, [auth?.token]);

  const fetchPizzas = async () => {
    setLoading(true);
    try {
      const data: any = await api.getPizzas();
      setPizzas(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load pizzas');
    } finally { setLoading(false); }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', image: '', category: 'veg', basePrice: 0, sizes: { small: 0, medium: 0, large: 0 }, toppings: [], popular: false, available: true });
  };

  const edit = (p: any) => {
    setEditing(p);
    setForm({ ...p, sizes: p.sizes || { small: p.basePrice, medium: p.basePrice, large: p.basePrice } });
  };

  const save = async () => {
    if (!token) return setError('Admin not logged in');
    try {
      if (editing) {
        const payload = { ...form, toppings: (typeof form.toppings === 'string') ? form.toppings.split(',').map((s: string) => s.trim()) : form.toppings };
        await api.updatePizza(token, editing.id, payload);
      } else {
        const payload = { ...form, toppings: (typeof form.toppings === 'string') ? form.toppings.split(',').map((s: string) => s.trim()) : form.toppings };
        await api.createPizza(token, payload);
      }
      await fetchPizzas();
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to save pizza');
    }
  };

  const del = async (id: string) => {
    if (!token) return setError('Admin not logged in');
    if (!confirm('Delete this pizza?')) return;
    try {
      await api.deletePizza(token, id);
      await fetchPizzas();
    } catch (err) {
      console.error(err);
      setError('Failed to delete pizza');
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!token) return setError('Admin not logged in');
    setUploading(true);
    try {
      const res = await api.uploadImage(token, file);
      setForm({ ...form, image: res.imageUrl });
    } catch (err) {
      console.error(err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Pizzas</h1>
          <div className="flex gap-2">
            <Button onClick={openNew}>Add New Pizza</Button>
            <Button variant="ghost" onClick={fetchPizzas}>Refresh</Button>
          </div>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto bg-card rounded p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-muted-foreground border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price (M)</th>
                  <th className="py-2">Available</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pizzas.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="py-3">{p.name}</td>
                    <td className="py-3">{p.category}</td>
                    <td className="py-3">₹{p.sizes?.medium || p.basePrice}</td>
                    <td className="py-3">{p.available ? 'Yes' : 'No'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => edit(p)}>Edit</Button>
                        <Button variant="destructive" onClick={() => del(p.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Area */}
        <div className="mt-8 bg-card p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Pizza' : 'New Pizza'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Category</label>
            <select title="Category" aria-label="Category" value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded border">
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Image</label>
              <Input value={form.image} onChange={(e: any) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" />
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" disabled={uploading} />
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Base Price</label>
              <Input type="number" value={form.basePrice} onChange={(e: any) => setForm({ ...form, basePrice: Number(e.target.value) })} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <Textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm mb-1">Sizes (small, medium, large)</label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" value={form.sizes.small} onChange={(e: any) => setForm({ ...form, sizes: { ...form.sizes, small: Number(e.target.value) } })} />
                <Input type="number" value={form.sizes.medium} onChange={(e: any) => setForm({ ...form, sizes: { ...form.sizes, medium: Number(e.target.value) } })} />
                <Input type="number" value={form.sizes.large} onChange={(e: any) => setForm({ ...form, sizes: { ...form.sizes, large: Number(e.target.value) } })} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Toppings (comma separated)</label>
              <Input value={typeof form.toppings === 'string' ? form.toppings : (form.toppings || []).join(', ')} onChange={(e: any) => setForm({ ...form, toppings: e.target.value })} />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.popular} onChange={(e: any) => setForm({ ...form, popular: e.target.checked })} /> Popular</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.available} onChange={(e: any) => setForm({ ...form, available: e.target.checked })} /> Available</label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={save}>{editing ? 'Update Pizza' : 'Create Pizza'}</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); openNew(); }}>Clear</Button>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    </main>
  );
}
