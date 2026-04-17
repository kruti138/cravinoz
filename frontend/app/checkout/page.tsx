'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin, Phone, CreditCard, Truck, CheckCircle2,
  Loader2, Tag, ShieldCheck, Clock, ChevronRight, X, AlertCircle,
  Banknote, Smartphone
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import Script from 'next/script';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 0;
const PROMO_CODES: Record<string, number> = {
  PIZZA10: 10,
  CRAVINOZ20: 20,
  FIRST50: 50,
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      }
    >
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <CheckoutContent />
    </React.Suspense>
  );
}

/* ───────────────────────────────────────────
   Skeleton Loader
─────────────────────────────────────────── */
function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  );
}

function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonBlock className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <SkeletonBlock className="h-6 w-36" />
                <SkeletonBlock className="h-11 w-full" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            ))}
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4 h-fit">
            <SkeletonBlock className="h-6 w-32" />
            {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-14 w-full" />)}
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────
   Payment method card
─────────────────────────────────────────── */
interface PaymentCardProps {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}

function PaymentCard({ id, label, desc, icon, badge, selected, onSelect }: PaymentCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group
        ${selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
        }`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors
        ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
            {label}
          </span>
          {badge && (
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

/* ───────────────────────────────────────────
   Section wrapper
─────────────────────────────────────────── */
function Section({
  icon, title, step, children
}: { icon: React.ReactNode; title: string; step: number; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
          {step}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Inline field + label
─────────────────────────────────────────── */
function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────
   Main checkout content
─────────────────────────────────────────── */
function CheckoutContent() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  /* Promo */
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  /* Form */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipcode: '',
    phone: '',
    paymentMethod: 'online', // Default to online
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const search = useSearchParams();
  const auth = useAuth();

  /* ── Auth / prefill ── */
  useEffect(() => {
    const token = auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) {
      const from = search?.get('next') || '/checkout';
      window.location.href = `/auth/login?next=${encodeURIComponent(from)}`;
      return;
    }
    if (auth?.user) {
      setFormData(prev => ({
        ...prev,
        name: (auth.user?.name || prev.name) as string,
        email: (auth.user?.email || prev.email) as string,
        phone: (auth.user?.phone || prev.phone) as string,
      }));
    } else {
      try {
        const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (u) {
          const parsed = JSON.parse(u);
          setFormData(prev => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
          }));
        }
      } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, [auth, search]);

  /* ── Price calc ── */
  const subtotal = cartItems.reduce((s, i) => s + i.customizationPrice * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.percent / 100) : 0;
  const total = subtotal + tax - discount + DELIVERY_FEE;

  /* ── Input helpers ── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Promo ── */
  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const percent = PROMO_CODES[code];
    if (percent === undefined) {
      setPromoError('Invalid promo code');
      return;
    }
    setAppliedPromo({ code, percent });
    setPromoError('');
    setPromoInput('');
    toast.success(`Promo "${code}" applied — ${percent}% off!`);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    toast.info('Promo code removed');
  };

  /* ── Validation ── */
  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.address.trim()) errors.address = 'Delivery address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.zipcode.trim()) errors.zipcode = 'Zip code is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    return errors;
  };

  const isFormComplete =
    !!(formData.name && formData.email && formData.address &&
    formData.city && formData.zipcode && formData.phone);

  /* ── Razorpay Integration ── */
  const handleRazorpayPayment = async (token: string) => {
    try {
      // 1. Create Razorpay Order on backend
      const rzpOrder = await api.createRazorpayOrder(token, {
        amount: total,
        currency: 'INR'
      });

      const options = {
        key: rzpOrder.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Cravinoz Pizza',
        description: 'Order Payment',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          setIsProcessing(true);
          try {
            // 2. Verify signature on backend
            const verifyRes = await api.verifyRazorpayPayment(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: cartItems,
                total,
                address: `${formData.address}, ${formData.city}, ${formData.zipcode}`,
                phone: formData.phone,
              }
            });

            if (verifyRes.success) {
              clearCart();
              toast.success('Payment successful! Order placed. 🎉');
              router.push(`/order-confirmation/${verifyRes.orderId}`);
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err: any) {
            toast.error('Verification error: ' + (err.message || 'Something went wrong'));
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#ef4444', // Red-500 (Primary)
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error('Failed to initialize payment: ' + (err.message || 'Server error'));
    }
  };

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    const token = auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!token) { router.push('/auth/login?next=/checkout'); return; }

    setIsProcessing(true);

    if (formData.paymentMethod === 'online') {
      await handleRazorpayPayment(token);
    } else {
      // COD Flow
      try {
        const order: any = await api.createOrder(token, {
          items: cartItems,
          total,
          payment: 'COD',
          address: `${formData.address}, ${formData.city}, ${formData.zipcode}`,
          phone: formData.phone,
          paymentStatus: 'PENDING'
        });
        if (typeof window !== 'undefined') localStorage.setItem('lastOrder', JSON.stringify(order));
        clearCart();
        toast.success('Order placed successfully! 🎉');
        setTimeout(() => router.push(`/order-confirmation/${order.id}`), 800);
      } catch (err: any) {
        toast.error('Failed to place order: ' + (err?.message || 'Server error'));
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) return <CheckoutSkeleton />;

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={cartItems.length} />

      {/* ── Page header ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>Cart</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-semibold">Checkout</span>
            <ChevronRight className="w-4 h-4" />
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground text-sm mb-8 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Estimated delivery: <strong className="text-foreground">25–35 minutes</strong>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ══════════════════════════
               LEFT COLUMN — Forms
          ══════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Delivery Address */}
            <Section icon={<MapPin className="w-4 h-4" />} title="Delivery Address" step={1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Full Name" required>
                    <Input
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={fieldErrors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{fieldErrors.name}
                      </p>
                    )}
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Email Address" required>
                    <Input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={fieldErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{fieldErrors.email}
                      </p>
                    )}
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Street Address" required>
                    <Input
                      name="address"
                      placeholder="123 Main Street, Apartment 4B"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={fieldErrors.address ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{fieldErrors.address}
                      </p>
                    )}
                  </Field>
                </div>
                <Field label="City" required>
                  <Input
                    name="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={fieldErrors.city ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fieldErrors.city}
                    </p>
                  )}
                </Field>
                <Field label="Zip / PIN Code" required>
                  <Input
                    name="zipcode"
                    placeholder="400001"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    className={fieldErrors.zipcode ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {fieldErrors.zipcode && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fieldErrors.zipcode}
                    </p>
                  )}
                </Field>
              </div>
            </Section>

            {/* 2. Contact */}
            <Section icon={<Phone className="w-4 h-4" />} title="Contact Information" step={2}>
              <Field label="Phone Number" required>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-lg border border-border bg-muted text-muted-foreground text-sm font-medium select-none">
                    +91
                  </div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`flex-1 ${fieldErrors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{fieldErrors.phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">We'll send order updates on this number</p>
              </Field>
            </Section>

            {/* 3. Payment */}
            <Section icon={<CreditCard className="w-4 h-4" />} title="Payment Method" step={3}>
              <div className="space-y-3">
                <PaymentCard
                  id="pay-online"
                  label="Online Payment (Razorpay)"
                  desc="UPI (GPay/PhonePe), Card, Netbanking & Wallets"
                  badge="secure"
                  icon={<Smartphone className="w-5 h-5" />}
                  selected={formData.paymentMethod === 'online'}
                  onSelect={() => setFormData(p => ({ ...p, paymentMethod: 'online' }))}
                />
                <PaymentCard
                  id="pay-cod"
                  label="Cash on Delivery"
                  desc="Pay when your order arrives at your door"
                  icon={<Banknote className="w-5 h-5" />}
                  selected={formData.paymentMethod === 'cod'}
                  onSelect={() => setFormData(p => ({ ...p, paymentMethod: 'cod' }))}
                />
              </div>

              {/* ── Online info ── */}
              {formData.paymentMethod === 'online' && (
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/50
                  animate-in fade-in slide-in-from-top-2 duration-200">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Fast & Secure Payments</p>
                    <p className="text-xs text-blue-700 mt-0.5">Redirecting to Razorpay Checkout. Supports UPI QR, apps, Credit/Debit cards and Netbanking.</p>
                  </div>
                </div>
              )}

              {/* ── COD info ── */}
              {formData.paymentMethod === 'cod' && (
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl border border-green-200 bg-green-50
                  animate-in fade-in slide-in-from-top-2 duration-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Cash on Delivery selected</p>
                    <p className="text-xs text-green-700 mt-0.5">Please keep exact change ready. Our delivery partner will collect payment.</p>
                  </div>
                </div>
              )}
            </Section>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 px-2 pb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                256-bit SSL Encryption
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="w-4 h-4 text-primary" />
                Free delivery on all orders
              </div>
            </div>
          </div>

          {/* ══════════════════════════
               RIGHT COLUMN — Summary
          ══════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border shadow-sm sticky top-24">

              {/* Header */}
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Order Summary</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
              </div>

              {/* Items */}
              <div className="p-6 space-y-3 max-h-56 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Your cart is empty</p>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                        🍕
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Pizza × {item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.size} · {item.crust.replace('-', ' ')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground flex-shrink-0">
                        ₹{item.customizationPrice * item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Promo code */}
              <div className="px-6 pb-4">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-green-300 bg-green-50">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{appliedPromo.code}</span>
                      <span className="text-xs text-green-600">−{appliedPromo.percent}% applied</span>
                    </div>
                    <button type="button" onClick={removePromo} className="text-green-600 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code (e.g. PIZZA10)"
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') applyPromo(); }}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyPromo}
                        className="flex-shrink-0 text-sm border-primary text-primary hover:bg-primary/5"
                      >
                        Apply
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{promoError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Try: PIZZA10, CRAVINOZ20, FIRST50</p>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="px-6 pb-4 space-y-2.5 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 5%)</span>
                  <span className="text-foreground font-medium">₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" />Promo discount
                    </span>
                    <span className="text-green-600 font-medium">−₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
              </div>

              {/* Total */}
              <div className="mx-6 my-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{total}</span>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-green-600 mt-1 text-right font-medium">
                    You save ₹{discount}!
                  </p>
                )}
              </div>

              {/* Delivery estimate */}
              <div className="mx-6 mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>Estimated delivery: <strong className="text-foreground">25–35 minutes</strong></span>
              </div>

              {/* CTA buttons */}
              <div className="px-6 pb-6 space-y-3">
                <Button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !isFormComplete || cartItems.length === 0}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold
                    disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processing…</>
                  ) : (
                    <>Place Order · ₹{total}</>
                  )}
                </Button>
                {!isFormComplete && (
                  <p className="text-xs text-muted-foreground text-center">
                    Fill all required fields to enable ordering
                  </p>
                )}
                <Button
                  id="back-to-cart-btn"
                  onClick={() => router.push('/cart')}
                  variant="outline"
                  size="lg"
                  className="w-full border-border text-foreground hover:bg-muted"
                  disabled={isProcessing}
                >
                  ← Back to Cart
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
