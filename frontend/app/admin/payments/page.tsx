'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminRoute from '@/components/AdminRoute';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, Search, Filter, ChevronLeft, ChevronRight,
  ExternalLink, CreditCard, Smartphone, Landmark, Wallet,
  CheckCircle2, XCircle, Clock, AlertCircle, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /* Filter states */
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const fetchPayments = useCallback(async (t: string, p: number, s: string, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminPayments(t, {
        count: PAGE_SIZE,
        skip: p * PAGE_SIZE,
        status: s,
        search: q
      });
      setPayments(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch payments. Please ensure your Razorpay keys are valid.');
      toast.error('Sync Error: Check API connection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token') || auth?.token;
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    setToken(adminToken);
    fetchPayments(adminToken, page, statusFilter, searchQuery);
  }, [auth?.token, router, page, statusFilter, searchQuery, fetchPayments]);

  const handleRefresh = () => {
    if (token) fetchPayments(token, page, statusFilter, searchQuery);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'refunded': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Smartphone className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'netbanking': return <Landmark className="w-4 h-4" />;
      case 'wallet': return <Wallet className="w-4 h-4" />;
      default: return <IndianRupee className="w-4 h-4" />;
    }
  };

  return (
    <AdminRoute>
      <main className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">💳 Payment Dashboard</h1>
              <p className="text-slate-500 mt-1">Real-time Razorpay transaction monitoring and filters.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://dashboard.razorpay.com/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Razorpay
              </Button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Payment ID or Email..."
                className="pl-10 h-11 border-slate-200 shadow-none focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                {['all', 'captured', 'failed', 'authorized'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(0); }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize
                      ${statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order / Ref</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="h-6 bg-slate-100 rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">No payments found</h3>
                          <p className="text-slate-500 max-w-xs mt-1">We couldn't find any payments matching your current filters.</p>
                          <Button 
                            variant="link" 
                            className="mt-4 text-primary"
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-slate-600 group-hover:text-primary">
                            {p.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500">{p.order_id || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">₹{p.amount / 100}</span>
                          <span className="ml-1 text-[10px] text-slate-400 font-medium uppercase">{p.currency}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(p.status)}`}>
                            {p.status === 'captured' && <CheckCircle2 className="w-3 h-3" />}
                            {p.status === 'failed' && <XCircle className="w-3 h-3" />}
                            {p.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              {getMethodIcon(p.method)}
                            </div>
                            <span className="capitalize">{p.method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">{p.email}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{p.contact}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500">
                            {new Date(p.created_at * 1000).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium font-mono">
                Showing entries <span className="text-slate-900 font-bold">{page * PAGE_SIZE + 1}</span> to <span className="text-slate-900 font-bold">{page * PAGE_SIZE + payments.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || loading}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg h-9 w-9 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                  {page + 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={payments.length < PAGE_SIZE || loading}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg h-9 w-9 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Alerts */}
          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">API Access Limited</p>
                <p className="text-xs opacity-90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale pointer-events-none select-none">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-5" />
          </div>
        </div>
      </main>
    </AdminRoute>
  );
}
