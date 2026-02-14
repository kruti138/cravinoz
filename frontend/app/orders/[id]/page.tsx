'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';
import api from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.token) return;
    
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(auth.token!, orderId);
        setOrder(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Set up polling to get real-time updates every 3 seconds
    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [auth?.token, orderId]);

  if (!auth?.user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Please log in to view order details</p>
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
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600 font-semibold">{error || 'Order not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={0} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-primary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Order #{order?.id?.substring(0, 8).toUpperCase() || orderId}
          </h1>
          <p className="text-muted-foreground">
            Track your order in real-time
          </p>
        </div>

        {/* Order Status Tracker */}
        <div className="mb-8">
          <OrderStatusTracker
            status={order?.status}
            createdAt={new Date(order?.createdAt)}
            confirmedAt={order?.confirmedAt ? new Date(order.confirmedAt) : undefined}
            preparingAt={order?.preparingAt ? new Date(order.preparingAt) : undefined}
            bakingAt={order?.bakingAt ? new Date(order.bakingAt) : undefined}
            outForDeliveryAt={order?.outForDeliveryAt ? new Date(order.outForDeliveryAt) : undefined}
            deliveredAt={order?.deliveredAt ? new Date(order.deliveredAt) : undefined}
          />
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {(order?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 mt-4 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₹{order?.total}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            {/* Delivery Info */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">🏠 Delivery Address</h3>
              <p className="text-sm mb-2">{order?.address}</p>
              <p className="text-sm"><strong>Phone:</strong> {order?.phone}</p>
            </div>

            {/* Payment Info */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">💳 Payment</h3>
              <p className="text-sm">
                <strong>Method:</strong> {order?.payment || 'N/A'}
              </p>
              <p className="text-sm mt-2">
                <strong>Status:</strong> Completed
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">⏱️ Timeline</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>Placed:</strong> {new Date(order?.createdAt).toLocaleString()}
                </p>
                {order?.confirmedAt && (
                  <p>
                    <strong>Confirmed:</strong> {new Date(order.confirmedAt).toLocaleString()}
                  </p>
                )}
                {order?.preparingAt && (
                  <p>
                    <strong>Preparing:</strong> {new Date(order.preparingAt).toLocaleString()}
                  </p>
                )}
                {order?.bakingAt && (
                  <p>
                    <strong>Baking:</strong> {new Date(order.bakingAt).toLocaleString()}
                  </p>
                )}
                {order?.outForDeliveryAt && (
                  <p>
                    <strong>Out for Delivery:</strong> {new Date(order.outForDeliveryAt).toLocaleString()}
                  </p>
                )}
                {order?.deliveredAt && (
                  <p>
                    <strong>Delivered:</strong> {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
