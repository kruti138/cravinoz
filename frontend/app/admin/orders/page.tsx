'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminRoute from '@/components/AdminRoute';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const auth = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const authToken = auth?.token;
    const finalToken = authToken || adminToken;
    if (!finalToken) {
      router.push('/admin/login');
      return;
    }
    setToken(finalToken);
    fetchOrders(finalToken);
  }, [auth?.token, router]);

  const fetchOrders = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.getAdminOrders(t);
      const parsed = data.map((o: any) => ({
        ...o,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      }));
      setOrders(parsed);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (orderId: string, newStatus: string) => {
    if (!token) return setError('Not authorized');
    setUpdatingId(orderId);
    try {
      const updated = await api.updateOrderStatus(token, orderId, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                confirmedAt: newStatus === 'CONFIRMED' || ORDER_STATUSES.indexOf(newStatus) > ORDER_STATUSES.indexOf('CONFIRMED') ? updated.confirmedAt : o.confirmedAt,
                preparingAt: newStatus === 'PREPARING' || ORDER_STATUSES.indexOf(newStatus) > ORDER_STATUSES.indexOf('PREPARING') ? updated.preparingAt : o.preparingAt,
                bakingAt: newStatus === 'BAKING' || ORDER_STATUSES.indexOf(newStatus) > ORDER_STATUSES.indexOf('BAKING') ? updated.bakingAt : o.bakingAt,
                outForDeliveryAt: newStatus === 'OUT_FOR_DELIVERY' || ORDER_STATUSES.indexOf(newStatus) > ORDER_STATUSES.indexOf('OUT_FOR_DELIVERY') ? updated.outForDeliveryAt : o.outForDeliveryAt,
                deliveredAt: newStatus === 'DELIVERED' ? updated.deliveredAt : o.deliveredAt,
              }
            : o
        )
      );
    } catch (err: any) {
      console.error(err);
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-700';
      case 'BAKING':
        return 'bg-orange-100 text-orange-700';
      case 'OUT_FOR_DELIVERY':
        return 'bg-green-100 text-green-700';
      case 'DELIVERED':
        return 'bg-green-600 text-white';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminRoute>
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">📦 Manage Orders</h1>
            <Button
              onClick={() => token && fetchOrders(token)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading && orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                    onClick={() => setExpanded(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Order #{order.id?.substring(0, 8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name || order.user?.email || 'Unknown'} • {order.items?.length || 0} items • ₹{order.total}
                      </p>
                    </div>
                    {expanded[order.id] ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expanded[order.id] && (
                    <div className="border-t border-border p-4 bg-slate-50 space-y-4">
                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">Update Status:</label>
                        <select
                          value={order.status}
                          onChange={(e) => changeStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="w-full md:w-48 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Items */}
                        <div>
                          <h4 className="font-semibold mb-2">📋 Order Items</h4>
                          <div className="space-y-2 bg-white p-3 rounded border border-border">
                            {(order.items || []).map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <div>
                                  <div className="font-medium">{item.name || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Size: {item.size || 'N/A'} • Qty: {item.quantity || 1}
                                  </div>
                                </div>
                                <div className="font-medium">₹{item.price || 0}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery & Payment */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">🏠 Delivery Address</h4>
                            <div className="bg-white p-3 rounded border border-border text-sm">
                              <p>{order.address || 'Not provided'}</p>
                              <p className="text-xs text-muted-foreground mt-1">Phone: {order.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">💳 Payment</h4>
                            <div className="bg-white p-3 rounded border border-border text-sm">
                              <p>Method: {order.payment || 'N/A'}</p>
                              <p>Total: ₹{order.total}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div>
                        <h4 className="font-semibold mb-2">⏱️ Timeline</h4>
                        <div className="bg-white p-3 rounded border border-border text-xs space-y-1 text-muted-foreground">
                          <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          {order.confirmedAt && <p><strong>Confirmed:</strong> {new Date(order.confirmedAt).toLocaleString()}</p>}
                          {order.preparingAt && <p><strong>Preparing:</strong> {new Date(order.preparingAt).toLocaleString()}</p>}
                          {order.bakingAt && <p><strong>Baking:</strong> {new Date(order.bakingAt).toLocaleString()}</p>}
                          {order.outForDeliveryAt && <p><strong>Out for Delivery:</strong> {new Date(order.outForDeliveryAt).toLocaleString()}</p>}
                          {order.deliveredAt && <p><strong>Delivered:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
                          {order.cancelledAt && <p><strong>Cancelled:</strong> {new Date(order.cancelledAt).toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}
