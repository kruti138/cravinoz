'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (auth?.user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [auth?.user?.role, router]);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res: any = await api.adminLogin({ email, password });
      localStorage.setItem('admin_token', res.token);
      // Also update auth context
      auth?.login(res.user, res.token);
      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full px-4 py-12 bg-card rounded-lg shadow-lg border-2 border-primary">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🍕 PizzaHub Admin</h1>
          <p className="text-muted-foreground text-sm">Admin Portal - Restricted Access</p>
        </div>
        
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Admin Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email"
              placeholder="admin@pizzahub.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}
          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </Button>
            <Button variant="outline" onClick={() => { setEmail(''); setPassword(''); setError(''); }} disabled={loading}>
              Reset
            </Button>
          </div>
        </form>
        
        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p className="text-xs">Admin credentials required</p>
          <p className="mt-3"><a href="/" className="text-primary hover:underline font-medium">← Back to Home</a></p>
        </div>
      </div>
    </main>
  );
}
