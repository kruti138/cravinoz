'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { normalizeImageUrl } from '@/lib/utils';
import { toppings } from '@/lib/mockData';
import { Plus, Minus, ChevronLeft } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type Size = 'small' | 'medium' | 'large';
type Crust = 'thin' | 'pan' | 'cheese-burst';

const sizePrices: Record<Size, number> = {
  small: 0,
  medium: 50,
  large: 100,
};

const crustPrices: Record<Crust, number> = {
  thin: 0,
  pan: 30,
  'cheese-burst': 50,
};

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const pizzaId = params.id as string;

  const [pizza, setPizza] = useState<any>(null);
  const [cartCount] = useState(0);

  useEffect(() => {
    if (pizzaId) {
      fetch(`/api/pizzas/${pizzaId}`)
        .then(res => res.json())
        .then(setPizza)
        .catch(console.error);
    }
  }, [pizzaId]);
  
  // Customization state
  const [size, setSize] = useState<Size>('medium');
  const [crust, setCrust] = useState<Crust>('pan');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  if (!pizza) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Pizza not found</p>
          <Button
            onClick={() => router.push('/menu')}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Back to Menu
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const toppingPrice = selectedToppings.reduce((sum, id) => {
    const topping = toppings.find(t => t.id === id);
    return sum + (topping?.price || 0);
  }, 0);

  const basePrice = pizza.price + sizePrices[size] + crustPrices[crust] + toppingPrice;
  const totalPrice = basePrice * quantity;

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings(prev =>
      prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const handleAddToCart = () => {
    // Store in localStorage for now
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      id: `${pizza.id}-${Date.now()}`,
      pizzaId: pizza.id,
      size,
      crust,
      toppings: selectedToppings,
      quantity,
      customizationPrice: basePrice,
    };
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    router.push('/cart');
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pizza Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-md bg-muted rounded-lg overflow-hidden mb-6">
              <Image
                src={normalizeImageUrl(pizza.image)}
                alt={pizza.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {pizza.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                {pizza.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-primary">
                    {pizza.rating}
                  </span>
                  <span className="text-muted-foreground">⭐</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({pizza.reviews} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="flex flex-col">
            <div className="bg-card p-6 rounded-lg shadow-sm space-y-8">
              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Select Size
                </h3>
                <ToggleGroup
                  type="single"
                  value={size}
                  onValueChange={(value) => setSize(value as Size)}
                  className="flex gap-2"
                >
                  <ToggleGroupItem
                    value="small"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Small
                    <br />
                    <span className="text-xs opacity-75">+₹0</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="medium"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Medium
                    <br />
                    <span className="text-xs opacity-75">+₹50</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="large"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Large
                    <br />
                    <span className="text-xs opacity-75">+₹100</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Crust Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Select Crust
                </h3>
                <ToggleGroup
                  type="single"
                  value={crust}
                  onValueChange={(value) => setCrust(value as Crust)}
                  className="flex gap-2"
                >
                  <ToggleGroupItem
                    value="thin"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Thin
                    <br />
                    <span className="text-xs opacity-75">+₹0</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="pan"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Pan
                    <br />
                    <span className="text-xs opacity-75">+₹30</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="cheese-burst"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Cheese Burst
                    <br />
                    <span className="text-xs opacity-75">+₹50</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Toppings Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Add Toppings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {toppings.map((topping) => (
                    <label
                      key={topping.id}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedToppings.includes(topping.id)}
                        onCheckedChange={() => toggleTopping(topping.id)}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">
                          {topping.name}
                        </span>
                        <span className="text-xs text-primary ml-1">
                          +₹{topping.price}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-foreground font-medium">Quantity:</span>
                  <div className="flex items-center gap-3 bg-muted p-2 rounded-lg">
                    <button
                      type="button"
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-foreground font-semibold min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      title="Increase quantity"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-muted p-4 rounded-lg mb-6 text-sm space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Price:</span>
                    <span>₹{pizza.price}</span>
                  </div>
                  {sizePrices[size] > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Size:</span>
                      <span>+₹{sizePrices[size]}</span>
                    </div>
                  )}
                  {crustPrices[crust] > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Crust:</span>
                      <span>+₹{crustPrices[crust]}</span>
                    </div>
                  )}
                  {toppingPrice > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Toppings:</span>
                      <span>+₹{toppingPrice}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                    <span>Price per Pizza:</span>
                    <span>₹{basePrice}</span>
                  </div>
                </div>

                {/* Total and Add to Cart */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-bold text-foreground">
                    Total: ₹{totalPrice}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base"
                >
                  Add to Cart
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
