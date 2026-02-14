'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AdminRoute from '@/components/AdminRoute';

export default function AdminIndex() {
  return (
    <AdminRoute>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          <p className="text-muted-foreground mb-6">Use the admin portal to manage pizzas, orders, users and settings.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/pizzas"><Button>Manage Pizzas</Button></Link>
            <Link href="/admin/orders"><Button>View Orders</Button></Link>
            <Link href="/admin/users"><Button>Manage Users</Button></Link>
          </div>
        </div>
      </main>
    </AdminRoute>
  );
}
