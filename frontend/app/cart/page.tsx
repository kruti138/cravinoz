'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import type { CartItem as CartItemType } from '@/lib/mockData';
import { ShoppingCart } from 'lucide-react';

const TAX_RATE = 0.05;

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const handleQuantityChange = (id: string, quantity: number) => {
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleRemove = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.customizationPrice * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

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
        <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">
          Shopping Cart
        </h1>
        <p className="text-muted-foreground mb-8">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Empty
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Start by adding some delicious pizzas from our menu"
            />
            <Button
              onClick={() => router.push('/menu')}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Order Summary
                </h3>
                
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
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      // redirect to login with return url
                      router.push('/auth/login?next=/checkout');
                      return;
                    }
                    router.push('/checkout');
                  }}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  onClick={() => router.push('/menu')}
                  variant="outline"
                  size="lg"
                  className="w-full mt-3 border-primary text-primary hover:bg-primary/5"
                >
                  Continue Shopping
                </Button>

                {subtotal > 0 && subtotal < 299 && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                    Add ₹{299 - subtotal} more to get free delivery!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
