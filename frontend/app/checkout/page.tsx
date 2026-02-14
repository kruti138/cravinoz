'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CartItem as CartItemType } from '@/lib/mockData';
import { MapPin, Phone, CreditCard } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const TAX_RATE = 0.05;

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipcode: '',
    phone: '',
    paymentMethod: 'cod',
  });

  const search = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // If not logged in, redirect to login (with next param) — enforce auth for checkout
    const token = auth?.token || localStorage.getItem('token');
    if (!token) {
      const next = '/checkout';
      // if a next query param was passed, use that instead
      const from = search?.get('next') || next;
      window.location.href = `/auth/login?next=${encodeURIComponent(from)}`;
      return;
    }

    // Prefill from auth user if available
    if (auth?.user) {
      setFormData(prev => ({
        ...prev,
        name: auth.user.name || prev.name,
        email: auth.user.email || prev.email,
        phone: auth.user.phone || prev.phone,
      }));
    } else {
      // Try to load user from localStorage fallback
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          setFormData(prev => ({ ...prev, name: parsed.name || prev.name, email: parsed.email || prev.email, phone: parsed.phone || prev.phone }));
        }
      } catch (err) { /* ignore */ }
    }

    setIsLoading(false);
  }, [auth, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.customizationPrice * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const token = auth?.token || localStorage.getItem('token');
    if (!token) {
      // force login flow
      router.push('/auth/login?next=/checkout');
      return;
    }

    setIsProcessing(true);

    const payload = {
      items: cartItems,
      total,
      payment: formData.paymentMethod,
      address: `${formData.address}, ${formData.city}, ${formData.zipcode}`,
      phone: formData.phone,
    };

    try {
      const order: any = await api.createOrder(token, payload);
      localStorage.setItem('lastOrder', JSON.stringify(order));
      localStorage.setItem('cart', '[]');
      router.push(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to place order: ' + (err?.message || 'server error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={cartItems.length} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={cartItems.length} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-balance">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Full Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Email *</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Delivery Address *</Label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">City *</Label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Zip Code *</Label>
                    <Input
                      type="text"
                      name="zipcode"
                      placeholder="10001"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Contact Information
                </h2>
              </div>

              <div>
                <Label className="text-foreground">Phone Number *</Label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Payment Method
                </h2>
              </div>

              <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer font-medium text-foreground">
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer mt-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="cursor-pointer font-medium text-foreground">
                    UPI
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x Pizza
                    </span>
                    <span className="text-foreground font-medium">
                      ₹{item.customizationPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span className="text-foreground font-medium">₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-primary font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">₹{total}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>

              <Button
                onClick={() => router.push('/cart')}
                variant="outline"
                size="lg"
                className="w-full mt-3 border-primary text-primary hover:bg-primary/5"
              >
                Back to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
