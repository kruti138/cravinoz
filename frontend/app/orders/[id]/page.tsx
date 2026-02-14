'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Truck, Phone, MapPin } from 'lucide-react';

type OrderStatus = 'confirmed' | 'preparing' | 'on-delivery' | 'delivered';

interface OrderStatusStep {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
}

const statusSteps: OrderStatusStep[] = [
  {
    status: 'confirmed',
    title: 'Order Confirmed',
    description: 'Your order has been received and confirmed.',
    icon: <CheckCircle className="w-6 h-6" />,
    estimatedTime: 'Just now',
  },
  {
    status: 'preparing',
    title: 'Preparing',
    description: 'Our chefs are preparing your delicious pizzas.',
    icon: <Circle className="w-6 h-6" />,
    estimatedTime: '10-15 min',
  },
  {
    status: 'on-delivery',
    title: 'Out for Delivery',
    description: 'Your order is on the way to your doorstep.',
    icon: <Truck className="w-6 h-6" />,
    estimatedTime: '20-30 min',
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Your order has been delivered successfully.',
    icon: <CheckCircle className="w-6 h-6" />,
    estimatedTime: 'Soon',
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('confirmed');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
      setCurrentStatus('confirmed');
    }
    setIsLoading(false);

    // Simulate status updates
    const timer1 = setTimeout(() => setCurrentStatus('preparing'), 5000);
    const timer2 = setTimeout(() => setCurrentStatus('on-delivery'), 20000);
    const timer3 = setTimeout(() => setCurrentStatus('delivered'), 35000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
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

  const currentStatusIndex = statusSteps.findIndex(s => s.status === currentStatus);

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={0} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-primary"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Order #{orderId}
          </h1>
          <p className="text-muted-foreground">
            Track your order in real-time
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-card p-8 rounded-lg shadow-sm border border-border mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-8">
            Delivery Status
          </h2>

          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = step.status === currentStatus;

              return (
                <div key={step.status} className="flex gap-6">
                  {/* Timeline Node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                    >
                      {step.icon}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-1 h-16 mt-2 transition-all ${
                          isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="pb-6 pt-2">
                    <h3
                      className={`text-lg font-semibold mb-1 ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Details */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Delivery Details
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Delivery Address
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    {order?.address}
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    {order?.city}, {order?.zipcode}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Contact Number
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    {order?.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    {currentStatus === 'delivered' 
                      ? 'Delivered' 
                      : '30-40 minutes from now'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              {order?.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x Pizza ({item.size})
                  </span>
                  <span className="text-foreground font-medium">
                    ₹{item.customizationPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">₹{order?.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground font-medium">₹{order?.tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">₹{order?.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-primary/5 p-6 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Pro Tip:</strong> You can also contact the delivery partner using the phone number above if needed.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
