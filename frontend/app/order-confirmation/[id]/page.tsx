'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Phone, Truck } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={0} />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your order has been successfully placed and is being prepared.
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Number */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold text-primary">{orderId}</p>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Estimated Delivery</p>
            <p className="text-2xl font-bold text-foreground">30-40 min</p>
            <p className="text-xs text-muted-foreground mt-2">From now</p>
          </div>

          {/* Delivery Address */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery to</p>
                <p className="text-foreground font-medium text-sm">
                  {order?.address}, {order?.city} {order?.zipcode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Order Items
          </h2>
          <div className="space-y-3">
            {order?.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-start pb-3 border-b border-border last:border-0">
                <div>
                  <p className="text-foreground font-medium">
                    {item.quantity}x {item.size.charAt(0).toUpperCase() + item.size.slice(1)} Pizza
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.crust.replace('-', ' ')} crust
                  </p>
                </div>
                <p className="text-foreground font-semibold">
                  ₹{item.customizationPrice * item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-muted p-6 rounded-lg mb-8">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">₹{order?.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span className="text-foreground font-medium">₹{order?.tax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-primary font-semibold">Free</span>
            </div>
            <div className="border-t border-border pt-3 mt-3 flex justify-between">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">₹{order?.total}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="w-5 h-5 text-primary flex-shrink-0" />
            <p>{order?.phone}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h3 className="font-semibold text-foreground mb-2">Payment Method</h3>
          <p className="text-muted-foreground">
            {order?.paymentMethod === 'cod' 
              ? 'Cash on Delivery' 
              : order?.paymentMethod === 'upi'
              ? 'UPI'
              : 'Card'}
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 mb-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            What's Next?
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>✓ Your order has been confirmed and sent to the restaurant</li>
            <li>✓ The restaurant will start preparing your pizzas</li>
            <li>✓ Our delivery partner will collect your order</li>
            <li>✓ You'll receive updates on your delivery status</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/orders/${orderId}`}>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
            >
              Track Order
            </Button>
          </Link>
          <Link href="/menu">
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/5 w-full bg-transparent"
            >
              Order Again
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
