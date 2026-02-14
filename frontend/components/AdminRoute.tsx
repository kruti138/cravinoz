'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

/**
 * AdminRoute - A wrapper component that protects admin routes
 * 
 * This component checks if:
 * 1. User is logged in
 * 2. User has ADMIN role
 * 
 * If not, it redirects to the home page.
 * 
 * Usage:
 * <AdminRoute>
 *   <AdminPageContent />
 * </AdminRoute>
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (!auth || !auth.user) {
      // Redirect to admin login, not user login
      router.push('/admin/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Check if user has admin role
    if (auth.user.role !== 'ADMIN') {
      // User is logged in but not an admin - redirect to home
      router.push('/');
    }
  }, [auth, router]);

  // Show nothing while checking (or could show a loading spinner)
  if (!auth || !auth.user || auth.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminRoute;
