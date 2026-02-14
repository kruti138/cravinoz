'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PizzaCard } from '@/components/PizzaCard';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { ChevronDown } from 'lucide-react';

export default function MenuPage() {
  const router = useRouter();
  const [cartCount] = useState(0);
  const [pizzasData, setPizzasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getPizzas().then((data: any) => setPizzasData(data)).catch((err: any) => { console.error(err); setError('Failed to load pizzas'); }).finally(() => setLoading(false));
  }, []);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [priceRange, setPriceRange] = useState([249, 399]);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-low' | 'price-high'>('popular');

  // Apply filters and sorting
  const filteredPizzas = useMemo(() => {
    let filtered = pizzasData.filter((pizza: any) => {
      const categoryMatch = categoryFilter === 'all' || pizza.category === categoryFilter;
      const priceMatch = pizza.price >= priceRange[0] && pizza.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        return filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
      case 'price-low':
        return filtered.sort((a: any, b: any) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a: any, b: any) => b.price - a.price);
      case 'popular':
      default:
        return filtered.sort((a: any, b: any) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
  }, [categoryFilter, priceRange, sortBy, pizzasData]);

  const handleCustomize = (pizzaId: string) => {
    router.push(`/customize/${pizzaId}`);
  };

  const minPrice = pizzasData.length > 0 ? Math.min(...pizzasData.map((p: any) => p.price)) : 0;
  const maxPrice = pizzasData.length > 0 ? Math.max(...pizzasData.map((p: any) => p.price)) : 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">
            Our Menu
          </h1>
          <p className="text-muted-foreground">
            Choose from {pizzasData.length} delicious pizzas
          </p>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Category Filter */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Category</h3>
            <ToggleGroup
              type="single"
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter((value ?? 'all') as 'all' | 'veg' | 'non-veg')}
              className="flex flex-col gap-2"
            >
              <div className="flex">
                <ToggleGroupItem
                  value="all"
                  className="justify-start flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  All Pizzas
                </ToggleGroupItem>
              </div>
              <div className="flex">
                <ToggleGroupItem
                  value="veg"
                  className="justify-start flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Vegetarian
                </ToggleGroupItem>
              </div>
              <div className="flex">
                <ToggleGroupItem
                  value="non-veg"
                  className="justify-start flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Non-Vegetarian
                </ToggleGroupItem>
              </div>
            </ToggleGroup>
          </div>

          {/* Price Range Filter */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
            <Slider
              min={minPrice}
              max={maxPrice}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                ₹{priceRange[0]}
              </span>
              <span className="text-sm text-muted-foreground">
                ₹{priceRange[1]}
              </span>
            </div>
          </div>

          {/* Sort Filter */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Sort By</h3>
            <select
              title="Sort By"
              aria-label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="bg-primary/10 p-6 rounded-lg flex flex-col justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {filteredPizzas.length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Pizzas Found
              </p>
            </div>
          </div>
        </div>

        {/* Pizza Grid */}
        {loading ? (
          <div className="py-12 text-center">Loading pizzas...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-muted rounded-lg">
            <p className="text-2xl font-semibold text-foreground mb-2">{error}</p>
            <p className="text-muted-foreground mb-6">Please try again later</p>
          </div>
        ) : filteredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-muted rounded-lg">
            <p className="text-2xl font-semibold text-foreground mb-2">
              No pizzas found
            </p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters
            </p>
            <Button
              onClick={() => {
                setCategoryFilter('all');
                setPriceRange([minPrice, maxPrice]);
                setSortBy('popular');
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
