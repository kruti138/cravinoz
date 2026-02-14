'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeImageUrl } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/lib/mockData';
import { toppings } from '@/lib/mockData';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [pizza, setPizza] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/pizzas/${item.pizzaId}`)
      .then(res => res.json())
      .then(setPizza)
      .catch(console.error);
  }, [item.pizzaId]);

  if (!pizza) return null;

  const selectedToppingNames = toppings
    .filter(t => item.toppings.includes(t.id))
    .map(t => t.name);
  
  const imageUrl = normalizeImageUrl(pizza.image);

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={pizza.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">
          {pizza.name}
        </h3>
        <div className="text-sm text-muted-foreground mt-1">
          <p>{item.size.charAt(0).toUpperCase() + item.size.slice(1)} - {item.crust.replace('-', ' ')}</p>
          {selectedToppingNames.length > 0 && (
            <p>Toppings: {selectedToppingNames.join(', ')}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-primary">
            ₹{item.customizationPrice}
          </span>
          
          {/* Quantity Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Decrease quantity"
              type="button"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="min-w-6 text-center font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Increase quantity"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onRemove(item.id)}
              className="ml-2 p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
              title="Remove item"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
