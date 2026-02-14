'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Pizza } from '@/lib/mockData';

interface PizzaCardProps {
  pizza: Pizza;
  onCustomize?: (pizzaId: string) => void;
}

export function PizzaCard({ pizza, onCustomize }: PizzaCardProps) {
  const rating = pizza.rating || 4.5;
  const reviews = pizza.reviews || 0;

  return (
    <div className="group rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-40 overflow-hidden bg-muted">
        {pizza.image ? (
          <img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        {pizza.popular && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Popular
          </Badge>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
          {pizza.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {pizza.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {rating}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviews} reviews)
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-primary">
            ₹{pizza.price}
          </span>
          <Button
            onClick={() => onCustomize?.(pizza.id)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Customize
          </Button>
        </div>
      </div>
    </div>
  );
}
