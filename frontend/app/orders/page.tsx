'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { ShoppingBag, ChevronRight, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';

export default function OrdersPage() {
  const router = useRouter();
  const auth = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    if (!auth?.token) return;
    try {
      const data = await api.getUserOrders(auth.token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [auth?.token]);

  // Set up polling - refresh every 5 seconds
  useEffect(() => {
    if (!auth?.token) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [auth?.token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
  };

  if (!auth?.user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Please log in to view your orders</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4">
            Login
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={0} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            My Orders
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          View and track all your orders. Updates every 5 seconds. ⏱️
        </p>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Empty
              icon={ShoppingBag}
              title="No orders yet"
              description="Start by placing your first order from our menu"
            />
            <Button
              onClick={() => router.push('/menu')}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="space-y-4">
                {/* Order Header */}
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          Order #{order.id?.substring(0, 8).toUpperCase()}
                        </h3>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'BAKING'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'} • ₹{order.total}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <Link href={`/orders/${order.id}`} className="w-full md:w-auto">
                      <Button
                        variant="outline"
                        className="w-full md:w-auto flex items-center gap-2"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Status Tracker */}
                <OrderStatusTracker
                  status={order.status}
                  createdAt={new Date(order.createdAt)}
                  confirmedAt={order.confirmedAt ? new Date(order.confirmedAt) : undefined}
                  preparingAt={order.preparingAt ? new Date(order.preparingAt) : undefined}
                  bakingAt={order.bakingAt ? new Date(order.bakingAt) : undefined}
                  outForDeliveryAt={order.outForDeliveryAt ? new Date(order.outForDeliveryAt) : undefined}
                  deliveredAt={order.deliveredAt ? new Date(order.deliveredAt) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
