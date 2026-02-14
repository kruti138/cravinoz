'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PizzaCard } from '@/components/PizzaCard';
import { Button } from '@/components/ui/button';
import { deals as mockDeals } from '@/lib/mockData';
import api from '@/lib/api';
import { Zap, Leaf, Truck } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [cartCount] = useState(0);
  const [pizzasData, setPizzasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPizzas().then((data: any) => setPizzasData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const popularPizzas = pizzasData.filter((p: any) => p.popular).slice(0, 6);
  const deals_list = mockDeals;

  const handleCustomize = (pizzaId: string) => {
    router.push(`/customize/${pizzaId}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      {/* Hero Section */}
      <section className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex items-center">
          <Image
            src="/pizza-hero.jpg"
            alt="Fresh pizza banner"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Freshly Baked Pizzas Delivered to Your Door
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl text-balance">
            Order your favorite pizza now and enjoy fast delivery with our premium quality ingredients and expert preparation.
          </p>
          <Button
            onClick={() => router.push('/menu')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-base"
          >
            Order Now
          </Button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Fast Delivery
            </h3>
            <p className="text-muted-foreground text-sm">
              Get your pizza delivered hot and fresh within 30 minutes or less.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Fresh Ingredients
            </h3>
            <p className="text-muted-foreground text-sm">
              We use only the finest, freshest ingredients in every pizza.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Best Prices
            </h3>
            <p className="text-muted-foreground text-sm">
              Enjoy premium quality pizzas at the most affordable prices.
            </p>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">
            Special Offers & Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals_list.map((deal) => (
              <div
                key={deal.id}
                className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
              >
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {deal.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {deal.description}
                </p>
                <div className="text-2xl font-bold text-primary">
                  {deal.discount}% OFF
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Pizzas Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">
          Popular Pizzas
        </h2>
        <p className="text-muted-foreground mb-8">
          Try our most loved pizza selections
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPizzas.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              pizza={pizza}
              onCustomize={handleCustomize}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            onClick={() => router.push('/menu')}
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            View All Menu
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
