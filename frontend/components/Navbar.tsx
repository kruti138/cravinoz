'use client';

import Link from 'next/link';
import { ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {
  const auth = (() => {
    try {
      return useAuth();
    } catch (e) {
      return null;
    }
  })();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = auth?.user?.name ? auth.user.name.split(' ').map(s => s[0]).slice(0,2).join('') : (auth?.user?.email?.charAt(0).toUpperCase() ?? 'U');

  return (
    <nav className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/90 transition-colors">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            🍕
          </div>
          <span>PizzaHub</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="text-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Menu
          </Link>
          
          {/* Admin link - only visible to admin users */}
          {auth && auth.user && auth.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Admin
            </Link>
          )}
          
          {/* Orders link - visible to logged in users */}
          {auth && auth.user && (
            <Link
              href="/orders"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Orders
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {auth && auth.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-foreground"
                aria-label="Account"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-md p-2">
                  <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-2 py-1 text-sm text-foreground hover:bg-muted rounded">Account</Link>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-2 py-1 text-sm text-foreground hover:bg-muted rounded">Orders</Link>
                  <button
                    onClick={() => { setMenuOpen(false); auth.logout(); }}
                    className="w-full flex items-center gap-2 px-2 py-1 text-sm text-foreground hover:bg-muted rounded"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="icon">
                <UserIcon className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
