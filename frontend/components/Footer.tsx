'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🍕</span> PizzaHub
            </h3>
            <p className="text-sm opacity-90">
              Delicious pizzas delivered fresh to your door.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline opacity-90 hover:opacity-100">Home</Link></li>
              <li><Link href="/menu" className="hover:underline opacity-90 hover:opacity-100">Menu</Link></li>
              <li><Link href="/orders" className="hover:underline opacity-90 hover:opacity-100">Orders</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline opacity-90 hover:opacity-100">About Us</Link></li>
              <li><Link href="#" className="hover:underline opacity-90 hover:opacity-100">Contact</Link></li>
              <li><Link href="#" className="hover:underline opacity-90 hover:opacity-100">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm mb-2">📞 +1 (800) 555-PIZZA</p>
            <p className="text-sm mb-4">✉️ hello@pizzahub.com</p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 hover:opacity-70 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:opacity-70 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:opacity-70 cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2024 PizzaHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
