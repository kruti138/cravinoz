'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const auth = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const authToken = auth?.token;
    const finalToken = authToken || adminToken;
    if (!finalToken) return router.push('/admin/login');
    setToken(finalToken);
    fetchUsers(finalToken);
  }, [auth?.token, router]);

  const fetchUsers = async (t: string) => {
    setLoading(true);
    try {
      const data: any = await api.getAdminUsers(t);
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load users');
    } finally { setLoading(false); }
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    if (!token) return setError('Not authorized');
    try {
      await api.setUserBlock(token, id, !blocked);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: !blocked } : u));
    } catch (err) {
      console.error(err);
      setError('Failed to update user');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <div className="flex gap-2">
            <Button onClick={() => token && fetchUsers(token)}>Refresh</Button>
          </div>
        </div>

        {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
          <div className="bg-card rounded p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-muted-foreground border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Registered</th>
                  <th className="py-2">Blocked</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">{u.role}</td>
                    <td className="py-3">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="py-3">{u.blocked ? 'Yes' : 'No'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant={u.blocked ? 'ghost' : 'destructive'} onClick={() => toggleBlock(u.id, u.blocked)}>{u.blocked ? 'Unblock' : 'Block'}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
